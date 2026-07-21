const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for easy per-day lookups
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    workingHours: { type: Number, default: 0 }, // in hours
    status: {
      type: String,
      enum: ["present", "late", "half-day", "absent"],
      default: "present",
    },
    // Captured from the browser's Geolocation API at the moment of check-in/out.
    checkInLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    checkOutLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    // True if the employee's face matched their enrolled face descriptor
    // closely enough (client-side check) before this check-in was submitted.
    faceVerifiedCheckIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One attendance record per employee per day.
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
