const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");
const Task = require("../models/Task");
const { calculateProductivityScore } = require("../utils/productivityScore");

const todayStr = () => new Date().toISOString().split("T")[0];
const dateStr = (d) => d.toISOString().split("T")[0];

// @desc   Get aggregate stats for the admin/HR/manager dashboard
// @route  GET /api/analytics/summary
// @access Admin, HR, Manager
const getSummary = asyncHandler(async (req, res) => {
  const [totalEmployees, departments, pendingLeaves, presentToday, payrollThisMonth, allTasks] =
    await Promise.all([
      Employee.countDocuments({ status: "active" }),
      Department.find(),
      Leave.countDocuments({ status: "pending" }),
      Attendance.countDocuments({ date: todayStr(), checkIn: { $ne: null } }),
      Payroll.countDocuments({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
      Task.find(),
    ]);

  // Department pie chart: employee count per department.
  const departmentBreakdown = await Promise.all(
    departments.map(async (dept) => ({
      name: dept.name,
      count: await Employee.countDocuments({ department: dept._id }),
    }))
  );

  // Leave stats grouped by status, for a simple bar/pie chart.
  const leaveStatuses = ["pending", "approved", "rejected"];
  const leaveStats = await Promise.all(
    leaveStatuses.map(async (status) => ({
      status,
      count: await Leave.countDocuments({ status }),
    }))
  );

  // --- Workforce analytics additions ---

  // Attendance trend for the last 7 days (org-wide check-in counts per day).
  const attendanceTrend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = dateStr(d);
    const count = await Attendance.countDocuments({ date: ds, checkIn: { $ne: null } });
    attendanceTrend.push({ date: ds, present: count });
  }

  // Org-wide task completion rate.
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;
  const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Average productivity score across all active employees (capped sample
  // size for performance on very large orgs — fine for a student/demo project).
  const activeEmployees = await Employee.find({ status: "active" }).limit(200).select("_id");
  let avgProductivityScore = 0;
  if (activeEmployees.length > 0) {
    const scores = await Promise.all(
      activeEmployees.map((e) => calculateProductivityScore(e._id))
    );
    avgProductivityScore = Math.round(
      scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    );
  }

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      totalDepartments: departments.length,
      pendingLeaves,
      presentToday,
      payslipsGeneratedThisMonth: payrollThisMonth,
      departmentBreakdown,
      leaveStats,
      attendanceTrend,
      taskCompletionRate,
      avgProductivityScore,
    },
  });
});

// @desc   Get the logged-in employee's own productivity score
// @route  GET /api/analytics/productivity/me
// @access Employee (self)
const getMyProductivity = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const result = await calculateProductivityScore(employee._id);
  res.status(200).json({ success: true, data: result });
});

// @desc   Get productivity scores for all active employees (or one, via ?employee=id)
// @route  GET /api/analytics/productivity
// @access Admin, HR, Manager
const getProductivity = asyncHandler(async (req, res) => {
  const { employee } = req.query;

  if (employee) {
    const result = await calculateProductivityScore(employee);
    return res.status(200).json({ success: true, data: [{ employee, ...result }] });
  }

  const employees = await Employee.find({ status: "active" })
    .populate({ path: "user", select: "name email" })
    .limit(200);

  const results = await Promise.all(
    employees.map(async (e) => ({
      employee: e._id,
      name: e.user?.name,
      employeeId: e.employeeId,
      ...(await calculateProductivityScore(e._id)),
    }))
  );

  res.status(200).json({ success: true, count: results.length, data: results });
});

module.exports = { getSummary, getMyProductivity, getProductivity };
