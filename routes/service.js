const express = require("express");
const { cachedService } = require("../services/service");
const router = express.Router();


/**
 * @swagger
 * /services:
 *   get:
 *     summary: Retrieve a list of services
 *     description: Retrieve paginated list of services with optional filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default 9)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by service category
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *     responses:
 *       200:
 *         description: A paginated list of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const { category, industry, page = 1, limit = 9 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (industry) query.industry = industry;

    const result = await cachedService.findServices(
      query,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (err) {
    console.error("GET /services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the service
 *     responses:
 *       200:
 *         description: Service found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Service not found
 */
router.get("/:id", async (req, res) => {
  try {
    const service = await cachedService.findServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    console.error("GET /services/:id error:", err);
    res.status(400).json({ error: "Invalid service ID" });
  }
});

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error or bad request
 */
router.post("/", async (req, res) => {
  try {
    const service = await cachedService.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    console.error("POST /services error:", err);
    res.status(400).json({ error: err.message || "Failed to create service" });
  }
});

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update an existing service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the service to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error or bad request
 *       404:
 *         description: Service not found
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await cachedService.updateService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("PUT /services/:id error:", err);
    res.status(400).json({ error: err.message || "Failed to update service" });
  }
});

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the service to delete
 *     responses:
 *       204:
 *         description: Service deleted successfully (no content)
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await cachedService.deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /services/:id error:", err);
    res.status(400).json({ error: err.message || "Failed to delete service" });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - industry
 *         - price
 *         - duration_hours
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum:
 *             - Financial Analysis
 *             - Marketing Analytics
 *             - Business Intelligence
 *             - Consulting Services
 *         industry:
 *           type: string
 *           enum:
 *             - Retail
 *             - E-commerce
 *             - Healthcare
 *             - Manufacturing
 *         price:
 *           type: number
 *           minimum: 0
 *         duration_hours:
 *           type: integer
 *           enum: [1, 2, 4, 8, 12]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
