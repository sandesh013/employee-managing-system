const asyncHandler = require("../utils/asyncHandler");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

// @desc   Apply for leave
// @route  POST /api/leaves
// @access Employee (self)
const applyLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const { leaveType, startDate, endDate, reason } = req.body;

  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error("End date cannot be before start date");
  }

  const leave = await Leave.create({
    employee: employee._id,
    leaveType,
    startDate,
    endDate,
    reason,
  });

  // Notify the employee's manager, if one is assigned.
  if (employee.manager) {
    await Notification.create({
      user: employee.manager,
      message: `${req.user.name} applied for ${leaveType} leave (${startDate.slice(0, 10)} - ${endDate.slice(0, 10)})`,
      type: "info",
      link: "/leaves",
    });
  }

  res.status(201).json({ success: true, data: leave });
});

// @desc   Get the logged-in employee's own leave history
// @route  GET /api/leaves/me
// @access Employee (self)
const getMyLeaves = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: leaves.length, data: leaves });
});

// @desc   Get all leave requests (optionally filter by status)
// @route  GET /api/leaves?status=pending
// @access Admin, HR, Manager
const getLeaves = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const leaves = await Leave.find(query)
    .populate({ path: "employee", populate: { path: "user", select: "name email" } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: leaves.length, data: leaves });
});

// @desc   Approve or reject a leave request
// @route  PUT /api/leaves/:id/status
// @access Admin, HR, Manager
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // "approved" | "rejected"
  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const leave = await Leave.findById(req.params.id).populate("employee");
  if (!leave) {
    res.status(404);
    throw new Error("Leave request not found");
  }

  leave.status = status;
  leave.approvedBy = req.user._id;
  await leave.save();

  await Notification.create({
    user: leave.employee.user,
    message: `Your ${leave.leaveType} leave request was ${status}`,
    type: status === "approved" ? "success" : "warning",
    link: "/leaves",
  });

  res.status(200).json({ success: true, data: leave });
});

module.exports = { applyLeave, getMyLeaves, getLeaves, updateLeaveStatus };
