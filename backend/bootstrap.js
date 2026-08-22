const fs = require("fs");
const path = require("path");
const remoteStore = require("./remoteStore");

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

module.exports = { restoreDatabaseFile };
