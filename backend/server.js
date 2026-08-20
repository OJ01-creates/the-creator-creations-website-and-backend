const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const messagesRoutes = require("./routes/messages");
const subscribersRoutes = require("./routes/subscribers");
const settingsRoutes = require("./routes/settings");
const uploadRoutes = require("./routes/upload");
const dashboardRoutes = require("./routes/dashboard");
const createCrudRouter = require("./routes/crudFactory");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Static: uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Static: admin dashboard SPA
app.use("/admin", express.static(path.join(__dirname, "public", "admin")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", createCrudRouter("projects"));
app.use("/api/services", createCrudRouter("services"));
app.use("/api/skills", createCrudRouter("skills"));
app.use("/api/milestones", createCrudRouter("milestones"));
app.use("/api/stats", createCrudRouter("stats"));
app.use("/api/messages", messagesRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Fallback: send admin index.html for any /admin/* client-side route
app.get("/admin/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`The Creator Creations backend running on http://localhost:${PORT}`);
  console.log(`Admin dashboard:      http://localhost:${PORT}/admin`);
  console.log(`API base:             http://localhost:${PORT}/api`);
});
