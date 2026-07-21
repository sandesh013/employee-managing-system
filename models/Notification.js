const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" }, // info | success | warning | error
    isRead: { type: Boolean, default: false },
    link: { type: String, default: "" }, // optional frontend route to navigate to
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
