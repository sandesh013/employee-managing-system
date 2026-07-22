const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    type: { type: String, default: "other" }, // e.g. resume, id-proof, certificate
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
