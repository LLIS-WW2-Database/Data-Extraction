const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

async function hashFile(filePath) {
  const hash = crypto.createHash('sha1');

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  return hash.digest('hex');
}

async function loadManifest(manifestPath) {
  if (!(await fs.pathExists(manifestPath))) {
    return {
      files: {},
      updatedAt: null,
      version: 1,
    };
  }

  return fs.readJson(manifestPath);
}

async function saveManifest(manifestPath, manifest) {
  await fs.ensureDir(path.dirname(manifestPath));
  await fs.writeJson(
    manifestPath,
    {
      ...manifest,
      updatedAt: new Date().toISOString(),
      version: 1,
    },
    { spaces: 2 },
  );
}

async function outputsExist(outputs = {}, image = {}) {
  const fileCandidates = [outputs.txt, outputs.json, ...(image.files || [])].filter(Boolean);

  if (fileCandidates.length === 0) {
    return false;
  }

  for (const filePath of fileCandidates) {
    if (!(await fs.pathExists(filePath))) {
      return false;
    }
  }

  return true;
}

async function shouldSkipFile(manifestEntry, fileHash) {
  if (!manifestEntry) {
    return false;
  }

  if (manifestEntry.status !== 'success' || manifestEntry.hash !== fileHash) {
    return false;
  }

  return outputsExist(manifestEntry.outputs, manifestEntry.image);
}

module.exports = {
  hashFile,
  loadManifest,
  outputsExist,
  saveManifest,
  shouldSkipFile,
};
