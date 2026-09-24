const { z } = require("zod");

// ---------- Shared ----------
const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ---------- Products ----------
const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional().default("newest"),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().min(10),
    price: z.coerce.number().positive("Price must be greater than 0"),
    stock: z.coerce.number().int().nonnegative().default(0),
    imageUrl: z.string().url("imageUrl must be a valid URL"),
    categoryId: z.string().min(1, "categoryId is required"),
  }),
});

const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(10).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().min(1).optional(),
  }),
});

// ---------- Posts ----------
const listPostsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    authorId: z.string().trim().optional(),
  }),
});

const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(200),
    content: z.string().trim().min(10),
    published: z.boolean().optional().default(true),
  }),
});

const updatePostSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().trim().min(3).max(200).optional(),
    content: z.string().trim().min(10).optional(),
    published: z.boolean().optional(),
  }),
});

// ---------- Comments ----------
const createCommentSchema = z.object({
  params: z.object({ postId: z.string().min(1) }),
  body: z.object({
    content: z.string().trim().min(1).max(1000),
  }),
});

// ---------- Orders ----------
const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.coerce.number().int().positive(),
        })
      )
      .min(1, "An order must contain at least one item"),
  }),
});

module.exports = {
  idParamSchema,
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
  listPostsSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  createOrderSchema,
};
