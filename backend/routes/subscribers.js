const express = require("express");
const { db, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: subscribe to the newsletter
router.post("/", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required" });

  const existing = db.get("subscribers").find({ email }).value();
  if (existing) return res.status(200).json({ success: true, alreadySubscribed: true });

  const id = nextId("subscribers");
  db.get("subscribers").push({ id, email, createdAt: new Date().toISOString() }).write();
  res.status(201).json({ success: true });
});

// Admin: list subscribers
router.get("/", requireAuth, (req, res) => {
  const items = db.get("subscribers").value() || [];
  res.json([...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Admin: delete a subscriber
router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  db.get("subscribers").remove({ id }).write();
  res.json({ success: true });
});

module.exports = router;
