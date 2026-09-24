/** Catches any request that didn't match a route and returns the standard error envelope. */
function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: {
      code: "ROUTE_NOT_FOUND",
      details: null,
    },
  });
}

module.exports = { notFoundHandler };
