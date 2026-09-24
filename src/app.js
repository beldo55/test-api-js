const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const { env } = require("./config/env");
const { swaggerSpec } = require("./swagger");
const { errorHandler } = require("./middleware/error.middleware");
const { notFoundHandler } = require("./middleware/not-found.middleware");
const { sendSuccess } = require("./utils/api-response");

const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const orderRoutes = require("./routes/order.routes");
const favoriteRoutes = require("./routes/favorite.routes");

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true, // required so the browser will send/receive the HttpOnly cookie
  })
);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", 
  (_req, res) => res.send(/*html*/ `
  <h1>Express Neon Practice API</h1>
  <p>Welcome to the Express Neon Practice API! This is a sample API built with Express.js and Neon, demonstrating various features and best practices for building RESTful APIs.</p>
  <p>For more information, visit the <a href="${env.clientUrl}/api-docs">API documentation</a>.</p>
  `
     ));

// --- Swagger docs ---
app.use((req, res, next) => {
  if (req.originalUrl === "/api-docs") {
    return res.redirect(301, "/api-docs/");
  }
  next();
});

const swaggerUiDistPath = path.dirname(require.resolve("swagger-ui-dist/swagger-ui-bundle.js"));
app.use("/api-docs", express.static(swaggerUiDistPath));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Express Neon Practice API Docs",
    swaggerOptions: { url: "/api-docs.json" },
  })
);
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

// --- Health check ---
app.get("/health", (_req, res) => sendSuccess(res, { message: "API is healthy", data: { uptime: process.uptime() } }));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
