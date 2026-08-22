const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const remoteStore = require("./remoteStore");

const DB_PATH = path.join(__dirname, "data", "db.json");
const SEED_PATH = path.join(__dirname, "data", "seed.json");

// By the time this module is required, server.js has already awaited
// restoreDatabaseFile() (see bootstrap.js) — so if a remote snapshot existed,
// DB_PATH already holds it. If it still doesn't exist here, this is a
// genuine first-ever boot (or Redis isn't configured), so fall back to seed.
if (!fs.existsSync(DB_PATH)) {
  fs.copyFileSync(SEED_PATH, DB_PATH);
}

const adapter = new FileSync(DB_PATH);
const db = low(adapter);

// Make sure every collection exists (in case of partial/older db.json)
db.defaults({
  admin: {},
  settings: {},
  projects: [],
  services: [],
  skills: [],
  milestones: [],
  stats: [],
  messages: [],
  subscribers: [],
  meta: { nextId: {} },
}).write();

/**
 * Upgrade path: when this backend is updated (e.g. new settings fields like
 * logoImage/heroImage/designerImage are introduced), an existing db.json on
 * disk won't have them yet. This additively fills in ONLY missing keys from
 * seed.json — anything already present (including edits made in the admin
 * dashboard) is left untouched. Safe to run on every startup.
 */
function migrate() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));

  // Fill missing top-level settings keys only (existing values always win).
  const currentSettings = db.get("settings").value() || {};
  const mergedSettings = { ...seed.settings, ...currentSettings };
  db.set("settings", mergedSettings).write();

  // For collections keyed by id (projects/milestones), fill in an empty
  // `image` field from the seed default if the item still has none set.
  ["projects", "milestones"].forEach((collectionName) => {
    const seedItems = seed[collectionName] || [];
    const current = db.get(collectionName).value() || [];
    current.forEach((item) => {
      if (!item.image) {
        const seedItem = seedItems.find((s) => s.id === item.id);
        if (seedItem && seedItem.image) {
          db.get(collectionName).find({ id: item.id }).assign({ image: seedItem.image }).write();
        }
      }
    });
  });
}

migrate();

// Push a fresh snapshot to Redis after every write, so the next container
// restart (which happens automatically on Render's free tier after idle
// time) restores exactly where things left off. This wraps lowdb's own
// write() — every `.write()` call anywhere in the app already goes through
// this same underlying method, so no route files need to change.
const originalWrite = db.write.bind(db);
db.write = (...args) => {
  const result = originalWrite(...args);
  const contents = fs.readFileSync(DB_PATH, "utf-8");
  remoteStore.saveSnapshot(contents); // fire-and-forget, never blocks the response
  return result;
};

function nextId(collection) {
  const current = db.get(`meta.nextId.${collection}`).value() || 1;
  db.set(`meta.nextId.${collection}`, current + 1).write();
  return current;
}

module.exports = { db, nextId };
