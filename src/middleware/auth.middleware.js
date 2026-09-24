const { env } = require("../config/env");
const { HttpError } = require("../utils/http-error");
const { verifyJwt } = require("../utils/tokens");

/** Requires a valid JWT HttpOnly cookie. Attaches `req.user` on success. */
function requireAuth(req, _res, next) {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    return next(HttpError.unauthorized("You must be logged in to access this resource"));
  }

  try {
    const payload = verifyJwt(token);
    req.user = payload;
    return next();
  } catch {
    return next(HttpError.unauthorized("Your session has expired. Please log in again", "INVALID_TOKEN"));
  }
}

/** Optional auth: attaches req.user if a valid cookie is present, but never rejects. */
function attachUserIfPresent(req, _res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return next();

  try {
    req.user = verifyJwt(token);
  } catch {
    // Ignore invalid/expired tokens for optional-auth routes.
  }
  return next();
}

/** Restricts a route to admins only. Must run after requireAuth. */
function requireAdmin(req, _res, next) {
  if (req.user?.role !== "ADMIN") {
    return next(HttpError.forbidden("Admin access required"));
  }
  return next();
}

module.exports = { requireAuth, attachUserIfPresent, requireAdmin };
