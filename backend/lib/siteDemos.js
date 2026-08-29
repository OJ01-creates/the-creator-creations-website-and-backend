const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const DEMOS_DIR = path.join(__dirname, "..", "demos");

/**
 * Extracts a zip buffer (an uploaded static site export) into destDir.
 *
 * Automatically flattens a single top-level wrapping folder if that's how
 * the zip is structured — a very common export pattern (e.g. the zip's only
 * root entry is "my-site/" containing everything else, or a "dist/" folder).
 * Also skips common OS junk entries (__MACOSX/, .DS_Store).
 *
 * Returns true if an index.html ends up sitting at the root of destDir
 * afterwards (what our static file server needs to actually serve the site).
 */
function extractSite(buffer, destDir) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries().filter((e) => {
    return !e.entryName.startsWith("__MACOSX/") && !e.entryName.endsWith(".DS_Store");
  });

  // Detect a single common top-level folder to strip away.
  const topLevelDirs = new Set();
  let hasRootFile = false;
  entries.forEach((e) => {
    const parts = e.entryName.split("/").filter(Boolean);
    if (parts.length === 0) return;
    if (e.isDirectory && parts.length === 1) topLevelDirs.add(parts[0]);
    if (!e.isDirectory && parts.length === 1) hasRootFile = true;
  });
  const stripPrefix = !hasRootFile && topLevelDirs.size === 1 ? `${[...topLevelDirs][0]}/` : null;

  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(destDir, { recursive: true });

  entries.forEach((entry) => {
    if (entry.isDirectory) return;
    let relativePath = entry.entryName;
    if (stripPrefix && relativePath.startsWith(stripPrefix)) {
      relativePath = relativePath.slice(stripPrefix.length);
    }
    if (!relativePath) return;

    // Guard against zip-slip (entries trying to write outside destDir).
    const outPath = path.join(destDir, relativePath);
    if (!outPath.startsWith(destDir)) return;

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, entry.getData());
  });

  return fs.existsSync(path.join(destDir, "index.html"));
}

module.exports = { extractSite, DEMOS_DIR };
