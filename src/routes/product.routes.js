const { Router } = require("express");
const productController = require("../controllers/product.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createProductSchema,
  idParamSchema,
  listProductsSchema,
  updateProductSchema,
} = require("../validators/resource.validators");

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products (paginated, searchable, filterable)
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
 *         description: Full-text search over name/description
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category slug
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, price_asc, price_desc] }
 *     responses:
 *       200:
 *         description: Paginated list of products
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, imageUrl, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               imageUrl: { type: string }
 *               categoryId: { type: string }
 *     responses:
 *       201: { description: Product created }
 *       401: { description: Not authenticated }
 *       422: { description: Validation error }
 */
router.get("/", validate(listProductsSchema), productController.listProducts);
router.post("/", requireAuth, validate(createProductSchema), productController.createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product found }
 *       404: { description: Product not found }
 *   patch:
 *     tags: [Products]
 *     summary: Update a product
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: Product updated }
 *       401: { description: Not authenticated }
 *       404: { description: Product not found }
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 *       401: { description: Not authenticated }
 *       404: { description: Product not found }
 */
router.get("/:id", validate(idParamSchema), productController.getProduct);
router.patch("/:id", requireAuth, validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", requireAuth, validate(idParamSchema), productController.deleteProduct);

module.exports = router;
