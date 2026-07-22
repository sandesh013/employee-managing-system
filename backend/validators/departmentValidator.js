const { body } = require("express-validator");

const departmentRules = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
];

module.exports = { departmentRules };
