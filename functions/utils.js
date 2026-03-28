/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const path = require('path');
const fs = require('fs-extra');

async function listFiles(inputFolderPath) {
  const files = await fs.readdir(inputFolderPath);
  return files.map((file) => path.join(inputFolderPath, file));
}

async function loopOverFiles(inputFolderPath) {
  return listFiles(inputFolderPath);
}

async function validateDocxInputs(inputFolderPath) {
  const filePaths = await listFiles(inputFolderPath);
  const validFiles = [];
  const invalidFiles = [];
  const fileStats = {};

  for (const filePath of filePaths) {
    const ext = path.extname(filePath).toLocaleLowerCase();
    const stat = await fs.stat(filePath);

    if (!stat.isFile()) {
      invalidFiles.push({
        filePath,
        reason: 'not_a_file',
      });
      continue;
    }

    if (ext !== '.docx') {
      invalidFiles.push({
        filePath,
        reason: 'unsupported_extension',
      });
      continue;
    }

    if (stat.size === 0) {
      invalidFiles.push({
        filePath,
        reason: 'empty_file',
      });
      continue;
    }

    fileStats[filePath] = {
      size: stat.size,
    };
    validFiles.push(filePath);
  }

  return {
    fileStats,
    invalidFiles,
    validFiles,
  };
}

module.exports = {
  loopOverFiles,
  validateDocxInputs,
};
