const Task = require("../models/Task");
const Attendance = require("../models/Attendance");

// Calculates a simple, transparent 0-100 productivity score for one employee,
// based on data already tracked elsewhere in the system — no external AI
// service involved. The formula is intentionally simple so it's easy to
// explain to anyone looking at it:
//
//   40% task completion rate      (completed tasks / total tasks)
//   40% attendance rate           (days present or half-day / days tracked)
//   20% punctuality rate          (on-time check-ins / total check-ins)
//
// Any component with no data yet defaults to a neutral "full score" for that
// slice, so a brand-new employee isn't unfairly penalized before they have
// any tasks or attendance history.
const LOOKBACK_DAYS = 30;

const calculateProductivityScore = async (employeeId) => {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceStr = since.toISOString().split("T")[0];

  const [tasks, attendanceRecords] = await Promise.all([
    Task.find({ assignedTo: employeeId }),
    Attendance.find({ employee: employeeId, date: { $gte: sinceStr } }),
  ]);

  // --- Task completion rate ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskScore = totalTasks === 0 ? 1 : completedTasks / totalTasks;

  // --- Attendance rate (present = 1 day, half-day = 0.5 day) ---
  const totalTracked = attendanceRecords.length;
  const presentWeight = attendanceRecords.reduce((sum, r) => {
    if (r.status === "present" || r.status === "late") return sum + 1;
    if (r.status === "half-day") return sum + 0.5;
    return sum;
  }, 0);
  const attendanceScore = totalTracked === 0 ? 1 : presentWeight / totalTracked;

  // --- Punctuality rate (checked in on time vs late) ---
  const checkedInDays = attendanceRecords.filter((r) => r.checkIn).length;
  const onTimeDays = attendanceRecords.filter((r) => r.checkIn && r.status !== "late").length;
  const punctualityScore = checkedInDays === 0 ? 1 : onTimeDays / checkedInDays;

  const rawScore = taskScore * 40 + attendanceScore * 40 + punctualityScore * 20;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score,
    breakdown: {
      taskCompletionRate: Math.round(taskScore * 100),
      attendanceRate: Math.round(attendanceScore * 100),
      punctualityRate: Math.round(punctualityScore * 100),
      totalTasks,
      completedTasks,
      daysTracked: totalTracked,
    },
  };
};

module.exports = { calculateProductivityScore, LOOKBACK_DAYS };
