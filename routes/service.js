const express = require("express");
const cachedService = require("../services/service");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, industry, page = 1, limit = 9 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (industry) query.industry = industry;

    const result = await cachedService.findServices(query, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await cachedService.findServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.post("/", async (req, res) => {
  try {
    const service = await cachedService.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await cachedService.updateService(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await cachedService.deleteService(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

module.exports = router;
