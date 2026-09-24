const app = require("./app");
const { env } = require("./config/env");
const { prisma } = require("./db");

const server = app.listen(env.port, () => {
  console.log(`\n🚀 Server running at http://localhost:${env.port}`);
  console.log(`📚 Swagger docs at http://localhost:${env.port}/api-docs`);
  console.log(`🌱 Environment: ${env.nodeEnv}\n`);
});

// Graceful shutdown so Prisma connections are closed cleanly.
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
