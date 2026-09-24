const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { validate } = require("../middleware/validate.middleware");
const { idParamSchema } = require("../validators/resource.validators");

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     responses:
 *       200: { description: List of categories }
 */
router.get("/", categoryController.listCategories);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a single category by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category found }
 *       404: { description: Category not found }
 */
router.get("/:id", validate(idParamSchema), categoryController.getCategory);

module.exports = router;
