const fs = require("fs");
const path = require("path");
const remoteStore = require("./remoteStore");
const { extractSite, DEMOS_DIR } = require("./lib/siteDemos");

const DB_PATH = path.join(__dirname, "data", "db.json");

/**
 * Call this once, at the very top of server.js, before requiring db.js or
 * any route file. If a Redis snapshot exists, it's written to data/db.json
 * so db.js picks it up on its very first read — restoring all admin edits
 * and content changes made before the last time this instance restarted.
 */
async function restoreDatabaseFile() {
  const snapshot = await remoteStore.getSnapshot();
  if (snapshot) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, snapshot);
    console.log("[bootstrap] Restored database from remote snapshot.");
  } else if (remoteStore.isConfigured()) {
    console.log("[bootstrap] Remote storage configured, but no snapshot found yet (first boot).");
  } else {
    console.log("[bootstrap] Remote storage not configured — using local file only (fine for local dev).");
  }
}

/**
 * Call this right after restoreDatabaseFile(), still before the server
 * starts listening. Re-downloads and re-extracts any project demo sites
 * whose local files are missing (e.g. after Render wiped the disk on
 * restart), using the backup zip URL saved in Cloudinary when each demo
 * was originally uploaded (see routes/demo.js).
 */
async function restoreDemoSites() {
  if (!fs.existsSync(DB_PATH)) return;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return;
  }

  const withDemos = (data.projects || []).filter((p) => p.demoZipUrl && p.demoSlug);
  if (withDemos.length === 0) return;

  for (const project of withDemos) {
    const destDir = path.join(DEMOS_DIR, project.demoSlug);
    if (fs.existsSync(path.join(destDir, "index.html"))) continue; // already present, nothing to do

    try {
      const res = await fetch(project.demoZipUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      extractSite(buffer, destDir);
      console.log(`[bootstrap] Restored demo site for project ${project.id} (${project.demoSlug}).`);
    } catch (err) {
      console.error(`[bootstrap] Failed to restore demo for project ${project.id}:`, err.message);
    }
  }
}

module.exports = { restoreDatabaseFile, restoreDemoSites };
