const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyEmployeeProfile,
  enrollMyFace,
  removeMyFace,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { employeeRules } = require("../validators/employeeValidator");

const router = express.Router();

router.use(protect); // every route below requires a logged-in user

router.get("/me/profile", getMyEmployeeProfile);
router.put("/me/face", enrollMyFace);
router.delete("/me/face", removeMyFace);

router
  .route("/")
  .get(authorize("admin", "hr", "manager"), getEmployees)
  .post(authorize("admin", "hr"), employeeRules, validate, createEmployee);

router
  .route("/:id")
  .get(authorize("admin", "hr", "manager"), getEmployeeById)
  .put(updateEmployee) // ownership + field restrictions are enforced inside the controller
  .delete(authorize("admin"), deleteEmployee);

module.exports = router;
