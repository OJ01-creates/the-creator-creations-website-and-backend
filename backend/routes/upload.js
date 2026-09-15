const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v"];
const AUDIO_EXT = [".mp3", ".wav", ".ogg", ".m4a", ".aac"];
const ALLOWED = [...IMAGE_EXT, ...VIDEO_EXT, ...AUDIO_EXT];

function mediaKindFor(ext) {
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (AUDIO_EXT.includes(ext)) return "audio";
  return null;
}

// Files are held in memory only (never written to local disk) — Render's
// free tier disk doesn't survive restarts, so every uploaded file goes
// straight to Cloudinary instead and we store its permanent URL.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — generous for a short video/audio clip
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return cb(new Error("Unsupported file type. Images, video (.mp4/.webm/.mov), and audio (.mp3/.wav/.ogg/.m4a) are supported."));
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

// Admin: upload an image, video, or audio file to Cloudinary.
// Returns { url, mediaType } — mediaType is "image", "video", or "audio",
// so the admin UI and frontend know how to render it back (<img>/<video>/<audio>).
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      error:
        "Media hosting isn't configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET as environment variables on your host (see backend/README.md).",
    });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const mediaType = mediaKindFor(ext);
  // Cloudinary handles audio through its video pipeline — there's no separate audio endpoint.
  const cloudinaryResourceType = mediaType === "image" ? "image" : "video";

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

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${cloudinaryResourceType}/upload`, {
      method: "POST",
      body: form,
    });

    const data = await cloudRes.json();
    if (!cloudRes.ok) {
      throw new Error(data?.error?.message || "Cloudinary upload failed");
    }

    res.status(201).json({ url: data.secure_url, mediaType });
  } catch (err) {
    console.error("[upload] Cloudinary upload failed:", err.message);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
