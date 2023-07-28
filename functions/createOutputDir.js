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
  constructor(parentFolderPath = __dirname) {
    this.parentFolderPath = parentFolderPath;
    this.createFileStructure();
  }

  createFolder(folderPath, folderName) {
    const fullFolderPath = path.join(folderPath, folderName);

    fs.mkdir(fullFolderPath, { recursive: true }, (err) => {
      if (err) {
        console.log(chalk.red('Folder Creation -> Error:', err));
      } else {
        console.log(chalk.green('Folder Creation -> Successful'));
      }
    });
  }

  async createFileStructure() {
    const filesFolderPath = path.join(this.parentFolderPath, 'Files');
    const inputsFolderPath = path.join(filesFolderPath, 'inputs');
    const outputsFolderPath = path.join(filesFolderPath, 'outputs');

    this.createFolder(this.parentFolderPath, 'Files');
    this.createFolder(inputsFolderPath, '');
    this.createFolder(outputsFolderPath, 'txt');
    this.createFolder(outputsFolderPath, 'images');
    this.createFolder(outputsFolderPath, 'json');
    this.createFolder(outputsFolderPath, 'all');
  }
}

module.exports = {
  BaseOutputDirectory,
};
