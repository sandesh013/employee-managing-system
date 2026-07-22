const asyncHandler = require("../utils/asyncHandler");
const PerformanceReview = require("../models/PerformanceReview");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

// @desc   Create a performance review for an employee
// @route  POST /api/performance
// @access Manager, HR, Admin
const createReview = asyncHandler(async (req, res) => {
  const { employee: employeeId, period, rating, comments } = req.body;

  const employee = await Employee.findById(employeeId).populate("user", "name");
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const review = await PerformanceReview.create({
    employee: employeeId,
    reviewer: req.user._id,
    period,
    rating,
    comments,
  });

  await Notification.create({
    user: employee.user._id,
    message: `You received a performance review for ${period}`,
    type: "info",
    link: "/performance",
  });

  res.status(201).json({ success: true, data: review });
});

// @desc   Get the logged-in employee's own performance reviews
// @route  GET /api/performance/me
// @access Employee (self)
const getMyReviews = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const reviews = await PerformanceReview.find({ employee: employee._id })
    .populate({ path: "reviewer", select: "name role" })
    .sort({ reviewDate: -1 });

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc   Get all reviews (optionally filter by employee)
// @route  GET /api/performance?employee=<id>
// @access Manager, HR, Admin
const getReviews = asyncHandler(async (req, res) => {
  const { employee } = req.query;
  const query = {};
  if (employee) query.employee = employee;

  const reviews = await PerformanceReview.find(query)
    .populate({ path: "employee", populate: { path: "user", select: "name email" } })
    .populate({ path: "reviewer", select: "name role" })
    .sort({ reviewDate: -1 });

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

module.exports = { createReview, getMyReviews, getReviews };
