const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function listProducts(req, res, next) {
  try {
    const { page, limit, search, category, minPrice, maxPrice, sort } = req.query;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: { slug: category } } : {},
        minPrice !== undefined ? { price: { gte: minPrice } } : {},
        maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
      ],
    };

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "price_asc"
          ? { price: "asc" }
          : sort === "price_desc"
            ? { price: "desc" }
            : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, {
      message: items.length ? "Products retrieved successfully" : "No products found for this query",
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!product) throw HttpError.notFound("Product not found", "PRODUCT_NOT_FOUND");

    return sendSuccess(res, { message: "Product retrieved successfully", data: product });
  } catch (err) {
    return next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } });
    if (!category) throw HttpError.badRequest("categoryId does not reference an existing category", "INVALID_CATEGORY");

    const product = await prisma.product.create({ data: req.body });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!exists) throw HttpError.notFound("Product not found", "PRODUCT_NOT_FOUND");

    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } });
      if (!category) throw HttpError.badRequest("categoryId does not reference an existing category", "INVALID_CATEGORY");
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return sendSuccess(res, { message: "Product updated successfully", data: product });
  } catch (err) {
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!exists) throw HttpError.notFound("Product not found", "PRODUCT_NOT_FOUND");

    await prisma.product.delete({ where: { id: req.params.id } });

    return sendSuccess(res, { message: "Product deleted successfully" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
