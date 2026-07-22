const express = require("express");
const {
  createTask,
  getMyTasks,
  getTasks,
  updateTaskStatus,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { taskRules } = require("../validators/taskValidator");

const router = express.Router();

router.use(protect);

router.get("/me", getMyTasks);
router.put("/:id/status", updateTaskStatus); // ownership checked inside the controller
router
  .route("/")
  .get(authorize("admin", "hr", "manager"), getTasks)
  .post(authorize("admin", "hr", "manager"), taskRules, validate, createTask);

module.exports = router;
