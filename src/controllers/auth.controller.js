const bcrypt = require("bcryptjs");
const { prisma } = require("../db");
const { env } = require("../config/env");
const { HttpError } = require("../utils/http-error");
const { sendSuccess } = require("../utils/api-response");
const { generateResetToken, getCookieOptions, hashResetToken, signJwt } = require("../utils/tokens");
const { sendPasswordResetEmail } = require("../services/email.service");

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MINUTES = 30;

function publicUser(user) {
  // Never return the password hash (or anything else sensitive) to the client.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw HttpError.conflict("An account with this email already exists", "EMAIL_TAKEN");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    res.cookie(env.cookieName, token, getCookieOptions());

    return sendSuccess(res, {
      statusCode: 201,
      message: "Account created successfully",
      data: publicUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw HttpError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw HttpError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    res.cookie(env.cookieName, token, getCookieOptions());

    return sendSuccess(res, {
      message: "Logged in successfully",
      data: publicUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(_req, res) {
  res.clearCookie(env.cookieName, { ...getCookieOptions(), maxAge: undefined });
  return sendSuccess(res, { message: "Logged out successfully" });
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      throw HttpError.notFound("User no longer exists", "USER_NOT_FOUND");
    }
    return sendSuccess(res, { message: "Current user retrieved", data: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same generic response so the API never reveals
    // whether a given email address has an account.
    const genericMessage =
      "If an account with that email exists, a password reset link has been sent.";

    if (user) {
      const { rawToken, tokenHash } = generateResetToken();
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

      // Invalidate any previous outstanding tokens for this user, then store the new hash.
      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({
          where: { userId: user.id, used: false },
          data: { used: true },
        }),
        prisma.passwordResetToken.create({
          data: { userId: user.id, tokenHash, expiresAt },
        }),
      ]);

      const resetLink = `${env.resetPasswordUrl}?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetLink);
    }

    return sendSuccess(res, { message: genericMessage });
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw HttpError.badRequest("This reset link is invalid or has expired", "INVALID_RESET_TOKEN");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return sendSuccess(res, { message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
