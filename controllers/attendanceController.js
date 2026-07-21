const asyncHandler = require("../utils/asyncHandler");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const todayStr = () => new Date().toISOString().split("T")[0];

// Office start time used to decide "late" status. Kept simple for now —
// could be moved into a settings collection later.
const OFFICE_START_HOUR = 9;
const HALF_DAY_THRESHOLD_HOURS = 4;

// @desc   Check in for today
// @route  POST /api/attendance/check-in
// @access Employee (self)
const checkIn = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const date = todayStr();
  const existing = await Attendance.findOne({ employee: employee._id, date });
  if (existing && existing.checkIn) {
    res.status(400);
    throw new Error("Already checked in today");
  }

  const now = new Date();
  const isLate = now.getHours() > OFFICE_START_HOUR || (now.getHours() === OFFICE_START_HOUR && now.getMinutes() > 15);

  const attendance =
    existing ||
    new Attendance({ employee: employee._id, date });

  const { lat, lng, faceVerified } = req.body || {};

  attendance.checkIn = now;
  attendance.status = isLate ? "late" : "present";
  if (typeof lat === "number" && typeof lng === "number") {
    attendance.checkInLocation = { lat, lng };
  }
  attendance.faceVerifiedCheckIn = !!faceVerified;
  await attendance.save();

  res.status(200).json({ success: true, data: attendance });
});

// @desc   Check out for today
// @route  POST /api/attendance/check-out
// @access Employee (self)
const checkOut = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const date = todayStr();
  const attendance = await Attendance.findOne({ employee: employee._id, date });

  if (!attendance || !attendance.checkIn) {
    res.status(400);
    throw new Error("You must check in before checking out");
  }
  if (attendance.checkOut) {
    res.status(400);
    throw new Error("Already checked out today");
  }

  const now = new Date();
  attendance.checkOut = now;

  const { lat, lng } = req.body || {};
  if (typeof lat === "number" && typeof lng === "number") {
    attendance.checkOutLocation = { lat, lng };
  }

  const hours = (now - attendance.checkIn) / (1000 * 60 * 60);
  attendance.workingHours = Math.round(hours * 100) / 100;

  if (hours < HALF_DAY_THRESHOLD_HOURS) {
    attendance.status = "half-day";
  }

  await attendance.save();
  res.status(200).json({ success: true, data: attendance });
});

// @desc   Get the logged-in employee's own attendance history
// @route  GET /api/attendance/me
// @access Employee (self)
const getMyAttendance = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const records = await Attendance.find({ employee: employee._id }).sort({ date: -1 });
  res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc   Get attendance for any employee, or the whole team (manager/HR/admin)
// @route  GET /api/attendance?employee=&date=
// @access Admin, HR, Manager
const getAttendance = asyncHandler(async (req, res) => {
  const { employee, date } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (date) query.date = date;

  const records = await Attendance.find(query)
    .populate({ path: "employee", populate: { path: "user", select: "name email" } })
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: records.length, data: records });
});

module.exports = { checkIn, checkOut, getMyAttendance, getAttendance };
