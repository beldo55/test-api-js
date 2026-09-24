const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const { HttpError } = require("../utils/http-error");

/**
 * Centralized error handler. Every controller either throws an HttpError
 * (or lets Zod / Prisma errors bubble up) and calls next(err) on catch —
 * this is the single place that turns errors into the standard API envelope.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Known, intentional application errors.
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details ?? null,
      },
    });
  }

  // Zod validation errors that weren't already normalized by a validate() middleware.
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
    });
  }

  // Prisma known request errors (unique constraint violations, FK errors, etc).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A record with this value already exists",
        error: { code: "DUPLICATE_ENTRY", details: err.meta ?? null },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        error: { code: "NOT_FOUND", details: null },
      });
    }
    return res.status(400).json({
      success: false,
      message: "Database request error",
      error: { code: "DATABASE_ERROR", details: { prismaCode: err.code } },
    });
  }

  // Anything unexpected.
  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
    error: { code: "INTERNAL_SERVER_ERROR", details: null },
  });
}

module.exports = { errorHandler };
