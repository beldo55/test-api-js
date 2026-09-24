const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function listMyFavorites(req, res, next) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } },
    });

    return sendSuccess(res, {
      message: favorites.length ? "Favorites retrieved successfully" : "You haven't favorited any products yet",
      data: favorites,
    });
  } catch (err) {
    return next(err);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) throw HttpError.notFound("Product not found", "PRODUCT_NOT_FOUND");

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user.sub, productId: req.params.productId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return sendSuccess(res, { message: "Product removed from favorites", data: { favorited: false } });
    }

    await prisma.favorite.create({
      data: { userId: req.user.sub, productId: req.params.productId },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product added to favorites",
      data: { favorited: true },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMyFavorites, toggleFavorite };
