const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: read site settings (hero copy, about copy, contact info, etc.)
router.get("/", (req, res) => {
  res.json(db.get("settings").value() || {});
});

// Admin: update site settings
router.put("/", requireAuth, (req, res) => {
  const updated = { ...(db.get("settings").value() || {}), ...req.body };
  db.set("settings", updated).write();
  res.json(updated);
});

module.exports = router;
