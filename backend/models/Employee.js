const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true }, // e.g. EMP0001
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    designation: { type: String, default: "" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dateOfJoining: { type: Date, default: Date.now },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    salary: {
      basic: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
    },

    education: [
      {
        degree: String,
        institution: String,
        yearOfCompletion: Number,
      },
    ],

    experience: [
      {
        company: String,
        role: String,
        from: Date,
        to: Date,
      },
    ],

    emergencyContact: {
      name: { type: String, default: "" },
      relation: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // 128-number face embedding captured client-side via face-api.js, used to
    // verify identity at check-in time. Never returned in list views — only
    // to the employee themself, since it's biometric data.
    faceDescriptor: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
