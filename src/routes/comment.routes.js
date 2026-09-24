const { Router } = require("express");
const commentController = require("../controllers/comment.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createCommentSchema } = require("../validators/resource.validators");

const router = Router();

/**
 * @openapi
 * /api/comments/post/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: List comments for a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of comments }
 *       404: { description: Post not found }
 *   post:
 *     tags: [Comments]
 *     summary: Add a comment to a post
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201: { description: Comment created }
 *       401: { description: Not authenticated }
 *       404: { description: Post not found }
 */
router.get("/post/:postId", commentController.listCommentsForPost);
router.post("/post/:postId", requireAuth, validate(createCommentSchema), commentController.createCommentForPost);

module.exports = router;
