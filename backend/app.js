const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

// --- Security & utility middleware ---
// crossOriginResourcePolicy is relaxed so uploaded files (payslips, documents,
// profile images) can be loaded by the Vite frontend on a different port.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan("dev")); // request logging in the terminal
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serves uploaded files (payslip PDFs, documents, profile images) statically.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic rate limiting to slow down brute-force attempts (e.g. login spam).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// --- Health check route (useful to confirm the server + DB are alive) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "EMS API is running" });
});

// --- Feature routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// --- Error handling (must stay last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
