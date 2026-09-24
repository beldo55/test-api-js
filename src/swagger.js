const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const { env } = require("./config/env");
const { swaggerSchemas } = require("./swagger-docs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express Neon Practice API",
      version: "1.0.0",
      description:
        "A practice REST API for frontend developers: authentication (JWT HttpOnly cookies), products, categories, posts, comments, orders, and favorites. " +
        "All successful responses follow `{ success, message, data, meta? }`; all errors follow `{ success, message, error: { code, details } }`.",
      contact: { name: "Express Neon Practice API" },
    },
    // A relative server URL makes Swagger's "Try it out" use the current
    // origin: localhost in development and the Vercel deployment in production.
    servers: [{ url: "/", description: "Current deployment" }],
    tags: [
      { name: "Auth", description: "Registration, login, logout, password reset" },
      { name: "Protected", description: "Simple practice routes that require authentication" },
      { name: "Products", description: "Product catalog: CRUD, search, filter, pagination" },
      { name: "Categories", description: "Product categories" },
      { name: "Posts", description: "Blog-style posts: CRUD" },
      { name: "Comments", description: "Comments on posts" },
      { name: "Orders", description: "Placing and viewing orders" },
      { name: "Favorites", description: "Favoriting products" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: env.cookieName,
          description:
            "JWT stored in an HttpOnly cookie, set automatically on register/login. " +
            'The frontend must call fetch() with `credentials: "include"` for this to work.',
        },
      },
      schemas: swaggerSchemas,
    },
  },
  // Scan route files for @openapi JSDoc comments.
  // __dirname is stable in Vercel's serverless filesystem; process.cwd() is not.
  apis: [path.join(__dirname, "routes", "*.js").replaceAll(path.sep, "/")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
