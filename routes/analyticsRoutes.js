const express = require("express");
const { getSummary, getMyProductivity, getProductivity } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/summary", authorize("admin", "hr", "manager"), getSummary);
router.get("/productivity/me", getMyProductivity);
router.get("/productivity", authorize("admin", "hr", "manager"), getProductivity);

module.exports = router;
