const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const messages = db.get("messages").value() || [];
  const subscribers = db.get("subscribers").value() || [];

  res.json({
    counts: {
      projects: (db.get("projects").value() || []).length,
      services: (db.get("services").value() || []).length,
      milestones: (db.get("milestones").value() || []).length,
      skills: (db.get("skills").value() || []).length,
      messages: messages.length,
      unreadMessages: messages.filter((m) => !m.read).length,
      subscribers: subscribers.length,
    },
    recentMessages: [...messages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    recentSubscribers: [...subscribers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
  });
});

module.exports = router;
