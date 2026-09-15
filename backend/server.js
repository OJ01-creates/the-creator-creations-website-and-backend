const { restoreDatabaseFile, restoreDemoSites } = require("./bootstrap");

/**
 * Everything that touches the database (db.js and every route file) is
 * required INSIDE this async start() function, after restoreDatabaseFile()
 * has finished. That ordering matters: requiring db.js immediately
 * initializes it from whatever's on disk, so the remote snapshot must be
 * written to disk first, or a restart on Render's free tier would silently
 * fall back to the original seed data instead of your latest edits.
 */
async function start() {
  await restoreDatabaseFile();
  await restoreDemoSites();

  const express = require("express");
  const cors = require("cors");
  const path = require("path");

  const authRoutes = require("./routes/auth");
  const messagesRoutes = require("./routes/messages");
  const subscribersRoutes = require("./routes/subscribers");
  const settingsRoutes = require("./routes/settings");
  const uploadRoutes = require("./routes/upload");
  const demoRoutes = require("./routes/demo");
  const dashboardRoutes = require("./routes/dashboard");
  const createCrudRouter = require("./routes/crudFactory");

  const app = express();
  const PORT = process.env.PORT || 4000;

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // Static: uploaded images (only used for the default seed images now —
  // new admin uploads go straight to Cloudinary, see routes/upload.js)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Static: deployed project demo sites (uploaded via /admin → Projects)
  app.use("/demos", express.static(path.join(__dirname, "demos")));

  // Static: admin dashboard SPA
  app.use("/admin", express.static(path.join(__dirname, "public", "admin")));

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", createCrudRouter("projects"));
  app.use("/api/projects", demoRoutes);
  app.use("/api/services", createCrudRouter("services"));
  app.use("/api/skills", createCrudRouter("skills"));
  app.use("/api/tools", createCrudRouter("tools"));
  app.use("/api/featured-slides", createCrudRouter("featuredSlides"));
  app.use("/api/updates", createCrudRouter("updates"));
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
}

start();
