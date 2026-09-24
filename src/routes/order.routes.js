const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createOrderSchema } = require("../validators/resource.validators");

const router = Router();

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List the current user's orders
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of orders }
 *       401: { description: Not authenticated }
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       201: { description: Order created }
 *       401: { description: Not authenticated }
 *       422: { description: Insufficient stock or invalid product }
 */
router.get("/", requireAuth, orderController.listMyOrders);
router.post("/", requireAuth, validate(createOrderSchema), orderController.createOrder);

module.exports = router;
