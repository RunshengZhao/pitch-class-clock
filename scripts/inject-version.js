#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");

function getVersion() {
  try {
    const raw = execSync("git describe --tags --always", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
    if (!raw) return "v0.0.0";
    if (raw.startsWith("v")) {
      return raw;
    }
    return `v0.0.0+${raw}`;
  } catch (err) {
    return "v0.0.0";
  }
}

function updateIndex(version) {
  const html = fs.readFileSync(indexPath, "utf8");
  const updated = html.replace(
    /<span id="app-version">.*?<\/span>/,
    `<span id="app-version">${version}</span>`
  );

  if (updated !== html) {
    fs.writeFileSync(indexPath, updated, "utf8");
    return true;
  }
  return false;
}

const version = getVersion();
const changed = updateIndex(version);

if (changed) {
  console.log(`Updated version to ${version}`);
}
