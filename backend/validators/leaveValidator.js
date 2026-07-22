const { body } = require("express-validator");

const applyLeaveRules = [
  body("leaveType").isIn(["sick", "casual", "paid", "unpaid", "other"]).withMessage("Invalid leave type"),
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").isISO8601().withMessage("Valid end date required"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
];

module.exports = { applyLeaveRules };
