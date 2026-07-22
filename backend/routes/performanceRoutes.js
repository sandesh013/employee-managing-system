const express = require("express");
const { createReview, getMyReviews, getReviews } = require("../controllers/performanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { performanceRules } = require("../validators/performanceValidator");

const router = express.Router();

router.use(protect);

router.get("/me", getMyReviews);
router
  .route("/")
  .get(authorize("admin", "hr", "manager"), getReviews)
  .post(authorize("admin", "hr", "manager"), performanceRules, validate, createReview);

module.exports = router;
