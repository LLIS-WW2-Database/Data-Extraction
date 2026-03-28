/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');
const { BaseOutputDirectory } = require('./createOutputDir');
const { loopOverFiles } = require('./utils');
const { derivePersonNameFromFilePath } = require('./normalization');

class DocxToImageConverter extends BaseOutputDirectory {
  constructor(parentFolder, options = {}) {
    super(parentFolder, options);
    this.inputFolderPath =
      options.inputFolderPath || path.join(parentFolder, './Files/inputs');
    this.outputFolderPath =
      options.imageOutputFolderPath || path.join(this.outputFolderPath, 'images');
  }
  /**
   * @description This will extract the name of the person associated with this document. (Given it is the first two words of any given document)
   *
   * @param {string} docxFilePath The path to the docx File
   * @returns {string} The name of the person associated with this document
   */
  getNameFromDocName(docxFilePath) {
    return derivePersonNameFromFilePath(docxFilePath);
  }

  /**
   * @description Creates a folder naming it after the docNam var. Then reads through the docx file and extracts all images, saving them to that folder and naming them using the following naming convention: docName-#
   *
   * @param {string} docxFilePath The path to the docx File
   * @param {string} docName The name of the document. The name of the person associated with the document
   * @returns {string[]} An array containing the file paths to the saved images
   */
  async extractImagesFromDocx(docxFilePath, docName) {
    const result = {
      count: 0,
      failures: [],
      files: [],
      types: [],
    };

    try {
      // Step 1: Convert docx to HTML using mammoth
      const { value } = await mammoth.convertToHtml({ path: docxFilePath });

      // Step 2: Parse the HTML using cheerio
      const $ = cheerio.load(value);

      // Step 3: Create a folder with the person's name (if it doesn't exist)
      const folderPath = path.join(this.outputFolderPath, docName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // Step 4: Extract and save images
      const images = [];
      $('img').each((index, element) => {
        const imageUrl = $(element).attr('src');
        if (imageUrl.startsWith('data:image/')) {
          // Extract image data from base64 URL
          const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');

          // Generate a unique filename for each image
          const imageExtension = imageUrl.substring(
            'data:image/'.length,
            imageUrl.indexOf(';base64'),
          );
          const imageName = `${docName}-${index + 1}.${imageExtension}`;
          const imagePath = path.join(folderPath, imageName);

          try {
            fs.writeFileSync(imagePath, imageBuffer);
            console.log(chalk.green('Image Conversion  -> Successful'));
            images.push(imagePath);
            result.files.push(imagePath);
            result.types.push(imageExtension);
          } catch (error) {
            result.failures.push({
              message: error.message,
              path: imagePath,
            });
            console.log(chalk.red('Image Conversion -> Error:', error));
          }
        }
      });

      result.count = images.length;
      return result;
    } catch (error) {
      console.log(chalk.red('Error occurred:', error));
      result.failures.push({
        message: error.message,
        path: docxFilePath,
      });
      return result;
    }
  }

  /**
   * @description This will loop through all docx files, get the names of the people associated to them, create a folder named  after them and then if applicable fill this folder with images from their file.
   */
  async getAllImages() {
    const filePaths = await loopOverFiles(this.inputFolderPath);

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const docName = this.getNameFromDocName(filePath);
      await this.extractImagesFromDocx(filePath, docName);
    }
  }
}

module.exports = DocxToImageConverter;
