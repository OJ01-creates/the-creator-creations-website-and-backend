const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const admin = db.get("admin").value();
  if (!admin || admin.username !== username) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = bcrypt.compareSync(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, user: { username: admin.username, email: admin.email } });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const admin = db.get("admin").value();
  res.json({ username: admin.username, email: admin.email });
});

// POST /api/auth/change-password
router.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  const admin = db.get("admin").value();
  const valid = bcrypt.compareSync(currentPassword, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.set("admin.passwordHash", newHash).write();
  res.json({ success: true });
});

module.exports = router;
