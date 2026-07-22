const { body } = require("express-validator");

const performanceRules = [
  body("employee").isMongoId().withMessage("Valid employee id is required"),
  body("period").trim().notEmpty().withMessage("Review period is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
];

module.exports = { performanceRules };
