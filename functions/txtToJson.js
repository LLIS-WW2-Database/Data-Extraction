/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const fs = require('fs');
const path = require('path');
const { BaseOutputDirectory } = require('./createOutputDir');
const chalk = require('chalk');
const { loopOverFiles } = require('./utils');

class TxtToJsonConverter extends BaseOutputDirectory {
  constructor(parentFolder) {
    super(parentFolder);
    this.inputFolderPath = path.join(parentFolder, './Files/outputs/txt');
    this.outputFolderPath = path.join(parentFolder, './Files/outputs/json');
  }

  /**
   * @description Converts a string to a JSON object
   *
   * @param {string} data The string to turn to JSON
   * @returns {object} A json object
   */
  parseDataToJSON(data) {
    const lines = data.split(/\r?\n/);
    const jsonOutput = {};
    let currentField = '';
    let isParsingWehrmacht = false;

    // Array of special fields within Wehrmacht
    const specialWehrmachtFields = ['Desertéiert', 'Verstoppt'];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line === '') continue;

      if (!jsonOutput['Name']) {
        // Extract the full name from the first line
        const nameMatch = line.match(/^(\S+\s*?\S+)/);
        if (nameMatch) {
          jsonOutput['Name'] = nameMatch[1].replace(/\t/g, ' ');
          line = line.replace(nameMatch[1], '').trim();
        }
      }

      if (line.includes(':')) {
        // If the line includes a colon, treat it as a field and value pair
        const [field, ...values] = line.split(':').map((item) => item.trim());
        const value = values.join(':').trim();
        if (field === 'Wehrmacht') {
          // Entering the Wehrmacht field, set the flag
          isParsingWehrmacht = true;
          jsonOutput[field] = value;
          currentField = field;
        } else if (
          isParsingWehrmacht &&
          specialWehrmachtFields.includes(field)
        ) {
          // Inside the Wehrmacht field, handle special fields as sub-fields
          const subField = `Wehrmacht-${field}`;
          jsonOutput[subField] = value;
        } else if (field) {
          jsonOutput[field] = value;
          currentField = field;
        } else if (currentField) {
          jsonOutput[currentField] += ' ' + value;
        }
      }
    }
    isParsingWehrmacht = false;

    return jsonOutput;
  }

  /**
   * @description Cleans up text, by removing leading and trailing spaces
   *
   * @param {string} text The text too clean
   * @returns {string} The cleaned up text
   */
  cleanText(text) {
    const lines = text.split(/\r?\n/);
    let cleanText = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line !== '') {
        cleanText += line + '\n';
      }
    }

    return cleanText.trim();
  }

  /**
   * @description Creates a new json file containing the provided json
   *
   * @param {object} jsonObj The object containing the json data
   * @param {string} filePath The path where the file should be created
   */
  writeJSONToFile(jsonObj, filePath) {
    try {
      const jsonString = JSON.stringify(jsonObj, null, 2);
      fs.writeFileSync(filePath, jsonString, 'utf8');
      console.log(chalk.green('Writing to JSON -> Successful'));
    } catch (error) {
      console.log(chalk.red('Writing to JSON -> Error:', error));
    }
  }

  /**
   * @description This returns the content of a txt file
   *
   * @param {string} filePath The path to the txt file
   * @returns {Promise<string>} The content of the txt file
   */
  readTextFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * @description This returns the content of a txt file
   *
   * @param {string} folderPath The path to the folder in which the text files are
   * @returns {Promise<string>} The content of the txt file
   */
  readTextFilesInFolder(folderPath) {
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          const filePromises = files.map((file) => {
            const filePath = path.join(folderPath, file);
            return this.readTextFile(filePath);
          });

          Promise.all(filePromises)
            .then((fileContents) => {
              resolve(fileContents);
            })
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }

  /**
   * @description Will convert a single text file to a JSON file
   * @param {string} txtFilePath The path to the input text file
   */
  async convertTxtToJson(txtFilePath) {
    try {
      const fileText = await this.readTextFile(txtFilePath);
      const cleanedTxt = this.cleanText(fileText);
      const jsonData = this.parseDataToJSON(cleanedTxt);

      const name = path.basename(txtFilePath, '.txt');
      const fileName = `${name}.json`;

      this.writeJSONToFile(
        jsonData,
        path.join(this.outputFolderPath, fileName),
      );
    } catch (error) {
      console.log(chalk.red('Error converting text file to JSON:', error));
    }
  }

  /**
   * @description Will convert all the text files in the outputs-txt folder to json files
   */
  async convertAllTxtToJson() {
    try {
      const txtFilePaths = await loopOverFiles(this.inputFolderPath);
      for (const txtFilePath of txtFilePaths) {
        await this.convertTxtToJson(txtFilePath);
      }
    } catch (error) {
      console.log(chalk.red('Error converting text files to JSON:', error));
    }
  }
}

module.exports = TxtToJsonConverter;
