const express = require("express");
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/me", getMyAttendance);
router.get("/", authorize("admin", "hr", "manager"), getAttendance);

module.exports = router;
