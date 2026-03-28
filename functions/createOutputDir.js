/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class BaseOutputDirectory {
  constructor(parentFolderPath = __dirname, options = {}) {
    this.parentFolderPath = parentFolderPath;
    this.outputFolderPath =
      options.outputFolderPath || path.join(this.parentFolderPath, 'Files', 'outputs');
  }

  createFolder(folderPath, folderName) {
    const fullFolderPath = path.join(folderPath, folderName);
    try {
      if (!fs.existsSync(fullFolderPath)) {
        fs.mkdirSync(fullFolderPath, { recursive: true });
        console.log(chalk.green('Folder Creation -> Successful'));
      }
    } catch (err) {
      console.log(chalk.red('Folder Creation -> Error:', err));
    }
  }

  async createFileStructure() {
    const filesFolderPath = path.join(this.parentFolderPath, 'Files');
    const inputsFolderPath = path.join(filesFolderPath, 'inputs');
    const outputsFolderPath = this.outputFolderPath;

    this.createFolder(this.parentFolderPath, 'Files');
    this.createFolder(inputsFolderPath, '');
    this.createFolder(outputsFolderPath, 'txt');
    this.createFolder(outputsFolderPath, 'images');
    this.createFolder(outputsFolderPath, 'json');
    this.createFolder(outputsFolderPath, 'all');
    this.createFolder(outputsFolderPath, 'reports');
    this.createFolder(outputsFolderPath, 'review');
  }
}

module.exports = {
  BaseOutputDirectory,
};
