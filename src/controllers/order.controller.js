const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function listMyOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } },
        },
      },
    });

    return sendSuccess(res, {
      message: orders.length ? "Orders retrieved successfully" : "You haven't placed any orders yet",
      data: orders,
    });
  } catch (err) {
    return next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { items } = req.body;

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      throw HttpError.badRequest("One or more products in the order do not exist", "INVALID_PRODUCT");
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.stock < item.quantity) {
        throw HttpError.unprocessable(
          `Not enough stock for "${product.name}" (requested ${item.quantity}, available ${product.stock})`,
          "INSUFFICIENT_STOCK"
        );
      }
    }

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.user.sub,
          total,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return { productId: item.productId, quantity: item.quantity, price: product.price };
            }),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Decrement stock for each purchased product.
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return created;
    });

    return sendSuccess(res, { statusCode: 201, message: "Order placed successfully", data: order });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMyOrders, createOrder };
