require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 5000),

  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",

  databaseUrl: required("DATABASE_URL"),
  directUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",

  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  cookieName: process.env.COOKIE_NAME ?? "access_token",

  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFrom: process.env.RESEND_FROM ?? "onboarding@resend.dev",

  resetPasswordUrl: process.env.RESET_PASSWORD_URL ?? "http://localhost:3000/reset-password",
};

module.exports = { env };
