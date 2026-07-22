// Wraps an async route handler so any thrown error / rejected promise
// is forwarded to Express's error-handling middleware, instead of needing
// a try/catch block in every single controller function.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
