const express = require("express");
const Service = require("../models/service");
const router = express.Router();

// Get all services
router.get("/", async (req, res) => {
  const { category, industry, page = 1, limit = 9 } = req.query;

  const query = {};
  if (category) query.category = category;
  if (industry) query.industry = industry;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [services, total] = await Promise.all([
    Service.find(query).skip(skip).limit(parseInt(limit)),
    Service.countDocuments(query),
  ]);

  res.json({
    data: services,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// Get one service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// Create service
router.post("/", async (req, res) => {
  const service = new Service(req.body);
  await service.save();
  res.status(201).json(service);
});

// Update service
router.put("/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// Delete service
router.delete("/:id", async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
