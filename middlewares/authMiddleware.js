const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// Verifies the JWT sent in the Authorization header and attaches the
// logged-in user (minus password) to req.user for downstream handlers.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error("Not authorized, user not found or deactivated");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Restricts a route to specific roles, e.g. authorize("admin", "hr").
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    const error = new Error(`Role '${req.user.role}' is not authorized to access this resource`);
    error.statusCode = 403;
    throw error;
  }
  next();
};

module.exports = { protect, authorize };
