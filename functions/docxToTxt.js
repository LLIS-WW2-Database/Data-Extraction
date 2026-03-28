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
const chalk = require('chalk');
const { BaseOutputDirectory } = require('./createOutputDir');
const { loopOverFiles } = require('./utils');
const {
  cleanupMojibake,
  derivePersonNameFromFilePath,
  normalizeWhitespace,
} = require('./normalization');

class DocxConverter extends BaseOutputDirectory {
  constructor(parentFolder, options = {}) {
    super(parentFolder, options);
    this.inputFolderPath =
      options.inputFolderPath || path.join(parentFolder, './Files/inputs');
    this.outputFolderPath =
      options.txtOutputFolderPath || path.join(this.outputFolderPath, 'txt');
  }

  /**
   * @description Converts a docx document to raw text
   * @param {string} path The path to the docx file
   *
   * @returns {Promise<string>} Returns the raw text
   */
  async convertToRawText(filePath) {
    const res = await mammoth.extractRawText({ path: filePath });
    return normalizeWhitespace(cleanupMojibake(res.value));
  }

  writeToTxtFile(filePath, textToWrite) {
    try {
      fs.writeFileSync(filePath, textToWrite, 'utf8');
      console.log(chalk.green('Writing to TXT -> Successful'));
    } catch (err) {
      console.log(chalk.red('Writing to TXT -> Error:', err));
      throw err;
    }
  }

  /**
   * @description Generates the output filename based on the first two words of the Word docx filename
   * @param {string} docxFilePath The path to the docx file
   * @returns {string} The output filename
   */
  generateOutputFileName(docxFilePath) {
    return `${derivePersonNameFromFilePath(docxFilePath)}.txt`;
  }

  async convertDocToTxt(docxFilePath) {
    const fileText = await this.convertToRawText(docxFilePath);
    const outPutFileName = this.generateOutputFileName(docxFilePath);
    const outPutFilePath = path.join(this.outputFolderPath, outPutFileName);

    this.writeToTxtFile(outPutFilePath, fileText);

    return {
      outputFilePath: outPutFilePath,
      outputFileName: outPutFileName,
      text: fileText,
    };
  }

  async convertAllDocsToTxt() {
    const filePaths = await loopOverFiles(this.inputFolderPath);

    // Loop through each file path and process it
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      await this.convertDocToTxt(filePath);
    }
  }
}

module.exports = DocxConverter;
