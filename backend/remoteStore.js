/**
 * Durable snapshot storage for the whole lowdb JSON database, backed by
 * Upstash Redis's REST API (works over plain HTTPS, no TCP client needed —
 * perfect for a free-tier host that may restart its filesystem at any time).
 *
 * Why this exists: Render's free web service tier does NOT persist local
 * disk writes across restarts/redeploys. Without this, every admin edit and
 * every uploaded image would vanish the next time the instance recycles
 * (which happens automatically after ~15 minutes of inactivity). This module
 * saves a full snapshot of data/db.json to Redis after every write, and
 * restores it before the server starts, so nothing is ever lost.
 *
 * Optional: if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN aren't set,
 * every function here is a safe no-op — the app falls back to local-file-only
 * behavior exactly as before (fine for local development).
 */
const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const SNAPSHOT_KEY = "creator_creations_db_snapshot";

function isConfigured() {
  return Boolean(REST_URL && REST_TOKEN);
}

async function redisCommand(args) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.result;
}

/** Fetches the last saved database snapshot as a JSON string, or null. */
async function getSnapshot() {
  if (!isConfigured()) return null;
  try {
    const result = await redisCommand(["GET", SNAPSHOT_KEY]);
    return result || null;
  } catch (err) {
    console.error("[remoteStore] Failed to fetch snapshot:", err.message);
    return null;
  }
}

/** Saves the full database as a snapshot. Fire-and-forget friendly — never throws. */
async function saveSnapshot(jsonString) {
  if (!isConfigured()) return;
  try {
    await redisCommand(["SET", SNAPSHOT_KEY, jsonString]);
  } catch (err) {
    console.error("[remoteStore] Failed to save snapshot:", err.message);
  }
}

module.exports = { isConfigured, getSnapshot, saveSnapshot };
