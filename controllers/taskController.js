const asyncHandler = require("../utils/asyncHandler");
const Task = require("../models/Task");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

// @desc   Assign a new task to an employee
// @route  POST /api/tasks
// @access Admin, HR, Manager
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, dueDate, priority } = req.body;

  const employee = await Employee.findById(assignedTo);
  if (!employee) {
    res.status(404);
    throw new Error("Assigned employee not found");
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    assignedBy: req.user._id,
    dueDate,
    priority,
  });

  await Notification.create({
    user: employee.user,
    message: `New task assigned: "${title}"`,
    type: "info",
    link: "/tasks",
  });

  res.status(201).json({ success: true, data: task });
});

// @desc   Get tasks assigned to the logged-in employee
// @route  GET /api/tasks/me
// @access Employee (self)
const getMyTasks = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const tasks = await Task.find({ assignedTo: employee._id }).sort({ dueDate: 1 });
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc   Get all tasks (optionally filter by employee or status)
// @route  GET /api/tasks
// @access Admin, HR, Manager
const getTasks = asyncHandler(async (req, res) => {
  const { assignedTo, status } = req.query;
  const query = {};
  if (assignedTo) query.assignedTo = assignedTo;
  if (status) query.status = status;

  const tasks = await Task.find(query)
    .populate({ path: "assignedTo", populate: { path: "user", select: "name email" } })
    .populate({ path: "assignedBy", select: "name email" })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc   Update a task's status (e.g. employee marks it in-progress/completed)
// @route  PUT /api/tasks/:id/status
// @access Employee (self, if assigned), Admin, HR, Manager
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "in-progress", "completed"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // If the requester is an employee, make sure they own this task.
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee || String(task.assignedTo) !== String(employee._id)) {
      res.status(403);
      throw new Error("You can only update your own tasks");
    }
  }

  task.status = status;
  await task.save();

  res.status(200).json({ success: true, data: task });
});

module.exports = { createTask, getMyTasks, getTasks, updateTaskStatus };
