// Catches any error passed via next(err) from controllers and sends a
// consistent JSON response instead of leaking a stack trace to the client.
//
// Every controller in this project uses the pattern:
//   res.status(404); throw new Error("Not found");
// That sets res.statusCode correctly, but by the time Express reaches this
// handler, res.statusCode may have already been reset to 200 in some Node/
// Express versions unless we check it before overwriting. We prefer whatever
// status was already set on the response (res.statusCode), then fall back to
// err.statusCode (used by notFound below), then finally 500.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusFromResponse = res.statusCode && res.statusCode !== 200 ? res.statusCode : null;
  const statusCode = statusFromResponse || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace only shown in development for easier debugging.
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Handles requests to routes that don't exist.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
