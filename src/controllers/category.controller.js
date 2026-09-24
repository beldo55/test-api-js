const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function listCategories(_req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return sendSuccess(res, {
      message: categories.length ? "Categories retrieved successfully" : "No categories found",
      data: categories,
    });
  } catch (err) {
    return next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) throw HttpError.notFound("Category not found", "CATEGORY_NOT_FOUND");

    return sendSuccess(res, { message: "Category retrieved successfully", data: category });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCategories, getCategory };
