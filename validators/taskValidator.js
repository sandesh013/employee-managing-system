const { body } = require("express-validator");

const taskRules = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("assignedTo").isMongoId().withMessage("Valid employee id is required"),
  body("priority").optional().isIn(["low", "medium", "high"]),
];

module.exports = { taskRules };
