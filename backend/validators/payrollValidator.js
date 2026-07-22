const { body } = require("express-validator");

const payrollRules = [
  body("employee").isMongoId().withMessage("Valid employee id is required"),
  body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12"),
  body("year").isInt({ min: 2000 }).withMessage("Valid year is required"),
  body("basic").isNumeric().withMessage("Basic salary must be a number"),
];

module.exports = { payrollRules };
