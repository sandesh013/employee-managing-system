const express = require("express");
const {
  applyLeave,
  getMyLeaves,
  getLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { applyLeaveRules } = require("../validators/leaveValidator");

const router = express.Router();

router.use(protect);

router.get("/me", getMyLeaves);
router.post("/", applyLeaveRules, validate, applyLeave);
router.get("/", authorize("admin", "hr", "manager"), getLeaves);
router.put("/:id/status", authorize("admin", "hr", "manager"), updateLeaveStatus);

module.exports = router;
