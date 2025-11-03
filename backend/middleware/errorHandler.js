/**
 * Centralized error handling middleware
 * Catches errors from routes and controllers, returns consistent JSON responses
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error("[ERROR]", err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Don't leak stack traces in production
  const response = {
    error: message,
    ...(process.env.ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
}
