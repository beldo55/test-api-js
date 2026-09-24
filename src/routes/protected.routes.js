const { Router } = require("express");
const protectedController = require("../controllers/protected.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();

/**
 * @openapi
 * /api/protected/profile:
 *   get:
 *     tags: [Protected]
 *     summary: Get the logged-in user's profile (practice route)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Profile data }
 *       401: { description: Not authenticated }
 */
router.get("/profile", requireAuth, protectedController.getProfile);

/**
 * @openapi
 * /api/protected/dashboard:
 *   get:
 *     tags: [Protected]
 *     summary: Get dummy dashboard statistics for the logged-in user (practice route)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Dashboard stats }
 *       401: { description: Not authenticated }
 */
router.get("/dashboard", requireAuth, protectedController.getDashboard);

module.exports = router;
