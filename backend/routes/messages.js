const express = require("express");
const { db, nextId } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public: submit a contact message (used by the ContactSection form)
router.post("/", (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "name, email, subject and message are required" });
  }

  const id = nextId("messages");
  const entry = {
    id,
    name,
    email,
    subject,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.get("messages").push(entry).write();
  res.status(201).json({ success: true });
});

// Admin: list all messages, newest first
router.get("/", requireAuth, (req, res) => {
  const items = db.get("messages").value() || [];
  res.json([...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Admin: mark as read/unread
router.put("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.get("messages").find({ id }).value();
  if (!existing) return res.status(404).json({ error: "Not found" });
  db.get("messages").find({ id }).assign({ read: !!req.body.read }).write();
  res.json({ success: true });
});

// Admin: delete a message
router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  db.get("messages").remove({ id }).write();
  res.json({ success: true });
});

module.exports = router;
