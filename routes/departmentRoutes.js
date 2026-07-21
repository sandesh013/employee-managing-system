const express = require("express");
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { departmentRules } = require("../validators/departmentValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getDepartments) // any logged-in role can view departments (e.g. for dropdowns)
  .post(authorize("admin"), departmentRules, validate, createDepartment);

router
  .route("/:id")
  .put(authorize("admin"), updateDepartment)
  .delete(authorize("admin"), deleteDepartment);

module.exports = router;
