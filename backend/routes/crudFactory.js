const express = require("express");
const { db, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");

/**
 * Builds a standard REST CRUD router for a top-level array collection in the db.
 * GET (list) and GET (single) are public so the public website can read content.
 * POST / PUT / DELETE / PATCH (reorder) require admin auth.
 */
function createCrudRouter(collectionName) {
  const router = express.Router();

  // List all (sorted by "order" if present)
  router.get("/", (req, res) => {
    const items = db.get(collectionName).value() || [];
    const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(sorted);
  });

  // Get single by id
  router.get("/:id", (req, res) => {
    const item = db.get(collectionName).find({ id: Number(req.params.id) }).value();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  // Create
  router.post("/", requireAuth, (req, res) => {
    const id = nextId(collectionName);
    const item = { id, ...req.body };
    db.get(collectionName).push(item).write();
    res.status(201).json(item);
  });

  // Update
  router.put("/:id", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get(collectionName).find({ id }).value();
    if (!existing) return res.status(404).json({ error: "Not found" });

    const updated = { ...existing, ...req.body, id };
    db.get(collectionName).find({ id }).assign(updated).write();
    res.json(updated);
  });

  // Reorder (bulk) — expects [{id, order}, ...]
  router.patch("/reorder", requireAuth, (req, res) => {
    const updates = req.body || [];
    updates.forEach(({ id, order }) => {
      db.get(collectionName).find({ id: Number(id) }).assign({ order }).write();
    });
    res.json({ success: true });
  });

  // Delete
  router.delete("/:id", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get(collectionName).find({ id }).value();
    if (!existing) return res.status(404).json({ error: "Not found" });

    db.get(collectionName).remove({ id }).write();
    res.json({ success: true });
  });

  return router;
}

module.exports = createCrudRouter;
