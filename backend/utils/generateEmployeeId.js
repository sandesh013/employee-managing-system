const Employee = require("../models/Employee");

// Generates a sequential-looking employee ID like EMP0001, EMP0002, ...
const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  const next = String(count + 1).padStart(4, "0");
  return `EMP${next}`;
};

module.exports = generateEmployeeId;
