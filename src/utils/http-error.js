/**
 * A typed application error carrying an HTTP status code, a machine-readable
 * error code, and optional details. Thrown from controllers and caught by
 * the centralized error-handling middleware.
 */
class HttpError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, HttpError);
  }

  static badRequest(message, code = "BAD_REQUEST", details = null) {
    return new HttpError(400, code, message, details);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
    return new HttpError(401, code, message);
  }

  static forbidden(message = "You do not have access to this resource", code = "FORBIDDEN") {
    return new HttpError(403, code, message);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new HttpError(404, code, message);
  }

  static conflict(message, code = "CONFLICT") {
    return new HttpError(409, code, message);
  }

  static unprocessable(message, code = "UNPROCESSABLE_ENTITY", details = null) {
    return new HttpError(422, code, message, details);
  }

  static internal(message = "Internal server error", code = "INTERNAL_SERVER_ERROR") {
    return new HttpError(500, code, message);
  }
}

module.exports = { HttpError };
