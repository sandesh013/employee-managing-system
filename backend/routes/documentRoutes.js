const express = require("express");
const {
  uploadDocument,
  getMyDocuments,
  getDocuments,
  deleteDocument,
} = require("../controllers/documentController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", getMyDocuments);
router.post("/", upload.single("file"), uploadDocument);
router.get("/", authorize("admin", "hr"), getDocuments);
router.delete("/:id", deleteDocument); // ownership checked inside the controller

module.exports = router;
