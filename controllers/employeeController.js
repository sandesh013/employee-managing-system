const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/Employee");
const User = require("../models/User");
const generateEmployeeId = require("../utils/generateEmployeeId");

// @desc   Create a new employee (also creates their login User account)
// @route  POST /api/employees
// @access Admin, HR
const createEmployee = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    designation,
    manager,
    phone,
    address,
    salary,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  // Create the login account first (defaults to 'employee' role unless specified).
  const user = await User.create({
    name,
    email,
    password: password || "changeme123", // employee should reset this after first login
    role: role || "employee",
  });

  const employeeId = await generateEmployeeId();

  const employee = await Employee.create({
    user: user._id,
    employeeId,
    department: department || undefined,
    designation,
    manager: manager || undefined,
    phone,
    address,
    salary,
  });

  await employee.populate([
    { path: "user", select: "name email role" },
    { path: "department", select: "name" },
  ]);

  res.status(201).json({ success: true, data: employee });
});

// @desc   Get all employees (optionally filter by department or search by name)
// @route  GET /api/employees
// @access Admin, HR, Manager
const getEmployees = asyncHandler(async (req, res) => {
  const { department, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (department) query.department = department;

  let employeesQuery = Employee.find(query)
    .select("-faceDescriptor")
    .populate({ path: "user", select: "name email role isActive" })
    .populate({ path: "department", select: "name" })
    .populate({ path: "manager", select: "name email" })
    .sort({ createdAt: -1 });

  const allEmployees = await employeesQuery;

  // Simple in-memory search by name/email since those live on the populated User.
  const filtered = search
    ? allEmployees.filter((e) =>
        `${e.user?.name} ${e.user?.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : allEmployees;

  const start = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(start, start + Number(limit));

  res.status(200).json({
    success: true,
    count: filtered.length,
    page: Number(page),
    totalPages: Math.ceil(filtered.length / Number(limit)),
    data: paginated,
  });
});

// @desc   Get a single employee by id
// @route  GET /api/employees/:id
// @access Admin, HR, Manager, (self)
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .select("-faceDescriptor")
    .populate({ path: "user", select: "name email role isActive" })
    .populate({ path: "department", select: "name" })
    .populate({ path: "manager", select: "name email" });

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.status(200).json({ success: true, data: employee });
});

// @desc   Update an employee's profile fields. Admin/HR can update anyone's
//         full record; an employee can only update their own safe fields
//         (never their own salary, department, designation, manager, or status).
// @route  PUT /api/employees/:id
// @access Admin, HR, or the employee themself (limited fields)
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const isOwnProfile = employee.user.toString() === req.user._id.toString();
  const isStaff = ["admin", "hr"].includes(req.user.role);

  if (!isStaff && !isOwnProfile) {
    res.status(403);
    throw new Error("You can only update your own profile");
  }

  // Employees may only touch their own personal-detail fields. Admin/HR can
  // update everything, including sensitive fields like salary and department.
  const allowedFields = isStaff
    ? [
        "department",
        "designation",
        "manager",
        "phone",
        "address",
        "salary",
        "education",
        "experience",
        "emergencyContact",
        "status",
        "profileImage",
      ]
    : ["phone", "address", "education", "experience", "emergencyContact", "profileImage"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) employee[field] = req.body[field];
  });

  await employee.save();
  await employee.populate([
    { path: "user", select: "name email role" },
    { path: "department", select: "name" },
  ]);

  res.status(200).json({ success: true, data: employee });
});

// @desc   Delete an employee (and their linked User login)
// @route  DELETE /api/employees/:id
// @access Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  await User.findByIdAndDelete(employee.user);
  await employee.deleteOne();

  res.status(200).json({ success: true, message: "Employee removed" });
});

// @desc   Get the employee profile linked to the currently logged-in user
// @route  GET /api/employees/me/profile
// @access Private (any logged-in employee)
const getMyEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id })
    .populate({ path: "user", select: "name email role" })
    .populate({ path: "department", select: "name" })
    .populate({ path: "manager", select: "name email" });

  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  res.status(200).json({ success: true, data: employee });
});

// @desc   Enroll (or replace) the logged-in employee's face descriptor,
//         captured client-side via face-api.js, for face-verified attendance.
// @route  PUT /api/employees/me/face
// @access Private (any logged-in employee)
const enrollMyFace = asyncHandler(async (req, res) => {
  const { descriptor } = req.body;

  if (!Array.isArray(descriptor) || descriptor.length < 64 || !descriptor.every((n) => typeof n === "number")) {
    res.status(400);
    throw new Error("A valid face descriptor is required");
  }

  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  employee.faceDescriptor = descriptor;
  await employee.save();

  res.status(200).json({ success: true, message: "Face enrolled successfully" });
});

// @desc   Remove the logged-in employee's enrolled face descriptor
// @route  DELETE /api/employees/me/face
// @access Private (any logged-in employee)
const removeMyFace = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  employee.faceDescriptor = undefined;
  await employee.save();

  res.status(200).json({ success: true, message: "Face enrollment removed" });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyEmployeeProfile,
  enrollMyFace,
  removeMyFace,
};
