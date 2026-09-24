const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

/** Signs a JWT for the given user payload ({ sub, email, role }). */
function signJwt(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/** Verifies and decodes a JWT. Throws if invalid or expired. */
function verifyJwt(token) {
  return jwt.verify(token, env.jwtSecret);
}

/**
 * Generates a random, URL-safe password reset token.
 * The RAW token is emailed to the user and never stored.
 * Only its SHA-256 hash is persisted, so a database leak can't be used
 * to reset accounts.
 */
function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  return { rawToken, tokenHash };
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/** Cookie options shared between login/register (set) and logout (clear). */
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day, keep in sync with JWT_EXPIRES_IN default
  };
}

module.exports = { signJwt, verifyJwt, generateResetToken, hashResetToken, getCookieOptions };
