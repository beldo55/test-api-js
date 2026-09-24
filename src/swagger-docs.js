/**
 * Reusable OpenAPI component schemas, kept separate from swagger.js so the
 * main config file stays readable. Referenced via components.schemas.
 */
const swaggerSchemas = {
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Request successful" },
      data: { type: "object", nullable: true },
      meta: { type: "object", nullable: true },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Resource not found" },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "NOT_FOUND" },
          details: { type: "object", nullable: true },
        },
      },
    },
  },
  User: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      role: { type: "string", enum: ["ADMIN", "USER"] },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Product: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "string", example: "49.99" },
      stock: { type: "integer" },
      imageUrl: { type: "string" },
      categoryId: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Category: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      slug: { type: "string" },
      description: { type: "string", nullable: true },
    },
  },
  Post: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      content: { type: "string" },
      published: { type: "boolean" },
      authorId: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Comment: {
    type: "object",
    properties: {
      id: { type: "string" },
      content: { type: "string" },
      postId: { type: "string" },
      authorId: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  Order: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      status: {
        type: "string",
        enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      },
      total: { type: "string", example: "129.99" },
      createdAt: { type: "string", format: "date-time" },
    },
  },
};

module.exports = { swaggerSchemas };
