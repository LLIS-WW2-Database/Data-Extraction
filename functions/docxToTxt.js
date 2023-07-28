/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const { loopOverFiles } = require('./utils');
const { BaseOutputDirectory } = require('./createOutputDir');
const chalk = require('chalk');

class DocxConverter extends BaseOutputDirectory {
  constructor(parentFolder) {
    super(parentFolder);
    this.inputFolderPath = path.join(parentFolder, './Files/inputs');
    this.outputFolderPath = path.join(parentFolder, './Files/outputs/txt');
  }

  /**
   * @description Converts a docx document to raw text
   * @param {string} path The path to the docx file
   *
   * @returns {Promise<string>} Returns the raw text
   */
  async convertToRawText(filePath) {
    const res = await mammoth
      .extractRawText({ path: filePath })
      .catch(function (error) {
        console.log(chalk.red(error));
      });

    const text = res.value;

    return text;
  }

  writeToTxtFile(filePath, textToWrite) {
    fs.writeFile(filePath, textToWrite, (err) => {
      if (err) {
        console.log(chalk.red('Writing to TXT -> Error:', err));
      } else {
        console.log(chalk.green('Writing to TXT -> Successful'));
      }
    });
  }

  /**
   * @description Generates the output filename based on the first two words of the Word docx filename
   * @param {string} docxFilePath The path to the docx file
   * @returns {string} The output filename
   */
  generateOutputFileName(docxFilePath) {
    const fileName = path.basename(docxFilePath);
    const personName = fileName
      .match(/^(\S+\s*?\S+)/)[0]
      .trim()
      .replace(/\s+/g, '-');
    return `${personName}.txt`;
  }

  async convertAllDocsToTxt() {
    const filePaths = await loopOverFiles(this.inputFolderPath);

    // Loop through each file path and process it
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];

      const fileText = await this.convertToRawText(filePath);

      // Generate the output filename based on the first two words of the Word docx filename
      const outPutFileName = this.generateOutputFileName(filePath);
      const outPutFilePath = path.join(this.outputFolderPath, outPutFileName);

      this.writeToTxtFile(outPutFilePath, fileText);
    }
  }
}

module.exports = DocxConverter;
