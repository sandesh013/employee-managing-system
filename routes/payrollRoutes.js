const express = require("express");
const { createPayroll, getMyPayroll, getPayrolls } = require("../controllers/payrollController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { payrollRules } = require("../validators/payrollValidator");

const router = express.Router();

router.use(protect);

router.get("/me", getMyPayroll);
router
  .route("/")
  .get(authorize("admin", "hr"), getPayrolls)
  .post(authorize("admin", "hr"), payrollRules, validate, createPayroll);

module.exports = router;
