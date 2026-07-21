const asyncHandler = require("../utils/asyncHandler");
const Department = require("../models/Department");
const Employee = require("../models/Employee");

// @desc   Create a department
// @route  POST /api/departments
// @access Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body;

  const existing = await Department.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error("A department with this name already exists");
  }

  const department = await Department.create({ name, description, head });
  res.status(201).json({ success: true, data: department });
});

// @desc   List all departments, with employee counts
// @route  GET /api/departments
// @access Private (any logged-in user)
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate({ path: "head", select: "name email" });

  // Attach a live employee count to each department (handy for the analytics pie chart).
  const withCounts = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ department: dept._id });
      return { ...dept.toObject(), employeeCount };
    })
  );

  res.status(200).json({ success: true, count: withCounts.length, data: withCounts });
});

// @desc   Update a department
// @route  PUT /api/departments/:id
// @access Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const { name, description, head } = req.body;
  if (name !== undefined) department.name = name;
  if (description !== undefined) department.description = description;
  if (head !== undefined) department.head = head;

  await department.save();
  res.status(200).json({ success: true, data: department });
});

// @desc   Delete a department
// @route  DELETE /api/departments/:id
// @access Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const employeeCount = await Employee.countDocuments({ department: department._id });
  if (employeeCount > 0) {
    res.status(400);
    throw new Error("Cannot delete a department that still has employees assigned to it");
  }

  await department.deleteOne();
  res.status(200).json({ success: true, message: "Department removed" });
});

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };
