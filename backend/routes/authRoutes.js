const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, validate, resetPassword);

module.exports = router;
