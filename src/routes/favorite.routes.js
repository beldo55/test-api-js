const { Router } = require("express");
const favoriteController = require("../controllers/favorite.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List the current user's favorite products
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of favorites }
 *       401: { description: Not authenticated }
 */
router.get("/", requireAuth, favoriteController.listMyFavorites);

/**
 * @openapi
 * /api/favorites/{productId}/toggle:
 *   post:
 *     tags: [Favorites]
 *     summary: Toggle a product's favorite status for the current user
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Favorite removed }
 *       201: { description: Favorite added }
 *       401: { description: Not authenticated }
 *       404: { description: Product not found }
 */
router.post("/:productId/toggle", requireAuth, favoriteController.toggleFavorite);

module.exports = router;
