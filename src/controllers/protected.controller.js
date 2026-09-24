const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) throw HttpError.notFound("User no longer exists", "USER_NOT_FOUND");

    return sendSuccess(res, {
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (err) {
    return next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.sub;

    const [postCount, commentCount, orderCount, favoriteCount, orders] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.order.findMany({ where: { userId }, select: { total: true } }),
    ]);

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

    return sendSuccess(res, {
      message: "Dashboard statistics retrieved successfully",
      data: {
        stats: {
          posts: postCount,
          comments: commentCount,
          orders: orderCount,
          favorites: favoriteCount,
          totalSpent: Number(totalSpent.toFixed(2)),
        },
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, getDashboard };
