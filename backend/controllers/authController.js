const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../services/emailService");
const User = require("../models/User");
const Employee = require("../models/Employee");
const generateEmployeeId = require("../utils/generateEmployeeId");

// @desc   Register a new user (defaults to 'employee' role unless an admin sets one)
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role: role || "employee" });

  // Self-registered employees get a linked Employee profile right away so
  // attendance, leave, tasks, payroll, and profile pages all work immediately.
  // (Admin/HR/Manager accounts created here are login-only; an admin can turn
  // them into full employee records later from the Employees module if needed.)
  if (user.role === "employee") {
    const employeeId = await generateEmployeeId();
    await Employee.create({ user: user._id, employeeId });
  }

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc   Log a user in
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact an admin.");
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc   Get the logged-in user's own profile
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// @desc   Request a password reset email
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Respond the same way whether or not the user exists, to avoid leaking
  // which emails are registered.
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "EMS Password Reset",
    html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to set a new password. This link expires in 30 minutes.</p>`,
  });

  res.status(200).json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
  });
});

// @desc   Reset password using the token emailed to the user
// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password has been reset. You can now log in." });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
