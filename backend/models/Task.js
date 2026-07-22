const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
