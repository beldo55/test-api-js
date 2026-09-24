const { PrismaClient } = require("@prisma/client");
const { env } = require("./config/env");

// Reuse a single PrismaClient instance across nodemon reloads in development
// to avoid exhausting the Neon connection pool.
const prisma = global.__prisma ?? new PrismaClient({ log: ["error", "warn"] });

if (!env.isProduction) {
  global.__prisma = prisma;
}

module.exports = { prisma };
