const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

// Files are held in memory only (never written to local disk) — Render's
// free tier disk doesn't survive restarts, so every uploaded image goes
// straight to Cloudinary instead and we store its permanent URL.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return cb(new Error("Unsupported file type"));
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

// Admin: upload an image to Cloudinary, returns { url } (a permanent, public URL)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      error:
        "Image hosting isn't configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET as environment variables on your host (see backend/README.md).",
    });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "creator-creations";
    const signature = signParams({ folder, timestamp }, apiSecret);

    const form = new FormData();
    form.append("file", new Blob([req.file.buffer]), req.file.originalname);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });

    const data = await cloudRes.json();
    if (!cloudRes.ok) {
      throw new Error(data?.error?.message || "Cloudinary upload failed");
    }

    res.status(201).json({ url: data.secure_url });
  } catch (err) {
    console.error("[upload] Cloudinary upload failed:", err.message);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
