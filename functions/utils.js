/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

/**
 * @description Loops over all files in the given folder and then returns an array of file paths
 * @param {string} inputFolderPath The path to the "inputs" folder
 *
 * @returns {Promise<string[]>} An array of file paths
 */
function loopOverFiles(inputFolderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(inputFolderPath, (err, files) => {
      if (err) {
        console.log(chalk.red('Error reading folder:', err));
        reject(err);
        return;
      }

      const filePaths = files.map((file) => path.join(inputFolderPath, file));
      resolve(filePaths);
    });
  });
}

module.exports.loopOverFiles = loopOverFiles;
