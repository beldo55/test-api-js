const { Router } = require("express");
const postController = require("../controllers/post.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createPostSchema, idParamSchema, listPostsSchema, updatePostSchema } = require("../validators/resource.validators");

const router = Router();

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: List published posts (paginated, searchable)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: authorId
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of posts }
 *   post:
 *     tags: [Posts]
 *     summary: Create a post
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               published: { type: boolean }
 *     responses:
 *       201: { description: Post created }
 *       401: { description: Not authenticated }
 */
router.get("/", validate(listPostsSchema), postController.listPosts);
router.post("/", requireAuth, validate(createPostSchema), postController.createPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a single post by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Post found }
 *       404: { description: Post not found }
 *   patch:
 *     tags: [Posts]
 *     summary: Update a post (author or admin only)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Post updated }
 *       403: { description: Not the post author }
 *       404: { description: Post not found }
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post (author or admin only)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Post deleted }
 *       403: { description: Not the post author }
 *       404: { description: Post not found }
 */
router.get("/:id", validate(idParamSchema), postController.getPost);
router.patch("/:id", requireAuth, validate(updatePostSchema), postController.updatePost);
router.delete("/:id", requireAuth, validate(idParamSchema), postController.deletePost);

module.exports = router;
