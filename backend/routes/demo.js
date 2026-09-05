const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");
const { db } = require("../db");
const { extractSite, DEMOS_DIR } = require("../lib/siteDemos");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB — generous for a static site export
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".zip") {
      return cb(new Error("Please upload a .zip file"));
    }
    cb(null, true);
  },
});

function signParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
}

// Admin: upload a static site .zip for a project, extract it, and serve it live at /demos/<slug>/
router.post("/:id/demo", requireAuth, upload.single("sourceZip"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const projectId = Number(req.params.id);
  const project = db.get("projects").find({ id: projectId }).value();
  if (!project) return res.status(404).json({ error: "Project not found" });

  const staticOnly = req.body.staticOnly === "true" || req.body.staticOnly === "1";
  const slug = `project-${projectId}`;
  const destDir = path.join(DEMOS_DIR, slug);

  let hasIndex;
  try {
    hasIndex = extractSite(req.file.buffer, destDir, { staticOnly });
  } catch (err) {
    return res.status(400).json({ error: "Couldn't read that zip file: " + err.message });
  }

  if (!hasIndex) {
    fs.rmSync(destDir, { recursive: true, force: true });
    return res.status(400).json({
      error:
        "No index.html found at the root of that zip (or inside a single wrapping folder). Make sure your build output's index.html is included.",
    });
  }

  const demoUrl = `${req.protocol}://${req.get("host")}/demos/${slug}/`;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // Still deploy locally — just can't back it up for durability across restarts.
    db.get("projects")
      .find({ id: projectId })
      .assign({ liveUrl: demoUrl, demoSlug: slug, demoStaticOnly: staticOnly })
      .write();
    return res.status(201).json({
      demoUrl,
      warning:
        "Demo is live, but Cloudinary isn't configured, so it won't survive a server restart yet. Add CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET (see backend/README.md).",
    });
  }

  // Back up the original zip to Cloudinary (raw file) so it survives Render's
  // free-tier restarts — restored automatically on the next boot, see bootstrap.js.
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "creator-creations-demos";
    const signature = signParams({ folder, public_id: slug, timestamp }, apiSecret);

    const form = new FormData();
    form.append("file", new Blob([req.file.buffer]), `${slug}.zip`);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);
    form.append("public_id", slug);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      body: form,
    });
    const data = await cloudRes.json();
    if (!cloudRes.ok) throw new Error(data?.error?.message || "Cloudinary upload failed");

    db.get("projects")
      .find({ id: projectId })
      .assign({ liveUrl: demoUrl, demoZipUrl: data.secure_url, demoSlug: slug, demoStaticOnly: staticOnly })
      .write();

    res.status(201).json({ demoUrl });
  } catch (err) {
    console.error("[demo] Cloudinary backup failed:", err.message);
    db.get("projects")
      .find({ id: projectId })
      .assign({ liveUrl: demoUrl, demoSlug: slug, demoStaticOnly: staticOnly })
      .write();
    res.status(201).json({
      demoUrl,
      warning:
        "Demo is live, but couldn't be backed up for persistence — it may not survive a server restart. Check your Cloudinary configuration.",
    });
  }
});

// Admin: remove a project's demo site
router.delete("/:id/demo", requireAuth, (req, res) => {
  const projectId = Number(req.params.id);
  const project = db.get("projects").find({ id: projectId }).value();
  if (!project) return res.status(404).json({ error: "Project not found" });

  const slug = project.demoSlug || `project-${projectId}`;
  fs.rmSync(path.join(DEMOS_DIR, slug), { recursive: true, force: true });

  db.get("projects").find({ id: projectId }).assign({ demoZipUrl: "", demoSlug: "", demoStaticOnly: false }).write();

  res.json({ success: true });
});

module.exports = router;
