const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true }, // e.g. "Q1 2026"
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, default: "" },
    reviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
