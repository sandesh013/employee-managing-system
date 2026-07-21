const asyncHandler = require("../utils/asyncHandler");
const Document = require("../models/Document");
const Employee = require("../models/Employee");
const { uploadToCloud } = require("../services/cloudinaryService");

// @desc   Upload a document for an employee (resume, ID proof, certificate, etc.)
// @route  POST /api/documents
// @access Private (self-upload) or Admin/HR (upload for anyone)
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const { title, type, employee: employeeIdFromBody } = req.body;

  // Employees upload to their own profile; admin/HR can specify a target employee.
  let employeeId = employeeIdFromBody;
  if (req.user.role === "employee") {
    const own = await Employee.findOne({ user: req.user._id });
    if (!own) {
      res.status(404);
      throw new Error("No employee profile linked to this account");
    }
    employeeId = own._id;
  }

  const fileUrl = await uploadToCloud(req.file.path, "ems/documents");

  const document = await Document.create({
    employee: employeeId,
    title: title || req.file.originalname,
    fileUrl,
    type: type || "other",
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: document });
});

// @desc   Get documents for the logged-in employee
// @route  GET /api/documents/me
// @access Employee (self)
const getMyDocuments = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    res.status(404);
    throw new Error("No employee profile linked to this account");
  }

  const documents = await Document.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: documents.length, data: documents });
});

// @desc   Get documents for any employee
// @route  GET /api/documents?employee=<id>
// @access Admin, HR
const getDocuments = asyncHandler(async (req, res) => {
  const { employee } = req.query;
  const query = {};
  if (employee) query.employee = employee;

  const documents = await Document.find(query)
    .populate({ path: "employee", populate: { path: "user", select: "name email" } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: documents.length, data: documents });
});

// @desc   Delete a document
// @route  DELETE /api/documents/:id
// @access Admin, HR, or the employee who owns it
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }

  if (req.user.role === "employee") {
    const own = await Employee.findOne({ user: req.user._id });
    if (!own || String(document.employee) !== String(own._id)) {
      res.status(403);
      throw new Error("You can only delete your own documents");
    }
  }

  await document.deleteOne();
  res.status(200).json({ success: true, message: "Document removed" });
});

module.exports = { uploadDocument, getMyDocuments, getDocuments, deleteDocument };
