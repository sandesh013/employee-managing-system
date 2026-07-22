const { body } = require("express-validator");

const employeeRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("department").optional().isMongoId().withMessage("Invalid department id"),
  body("salary.basic").optional().isNumeric().withMessage("Basic salary must be a number"),
];

module.exports = { employeeRules };
