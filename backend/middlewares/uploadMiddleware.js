const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the local uploads folder exists (used as staging + fallback storage).
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;

const fileFilter = (req, file, cb) => {
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extValid) return cb(null, true);
  cb(new Error("Only images, PDF, and Word documents are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
