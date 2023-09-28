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
const { expectedMainFields, requiredMainFields, subfields } = require("../Constants")

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
    // Split the input data into lines
    const lines = data.split(/\r?\n/);

    // Initialize the JSON output object and other variables
    const jsonOutput = {};
    let currentField = '';

    // Loop through each line in the input data
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line === '') continue; // Skip empty lines

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

        if (expectedMainFields.includes(field)) {
          // Main field is expected, add it to the JSON with the value
          jsonOutput[field] = value;
          currentField = field;
        } else if (this.isSubfield(field)) {
          // Check if it's a subfield (without the main field prefix)
          const mainField = this.findMainFieldForSubfield(field);
          if (mainField) {
            const fullSubfield = `${mainField}-${field}`;
            jsonOutput[fullSubfield] = value;
          } else {
            console.log(chalk.yellow(`Unexpected field: ${field}`));
          }
        } else {
          // Field is unexpected, throw an error
          console.log(chalk.yellow(`Unexpected field: ${field}`));
        }
      }
    }

    // Ensure all required main fields are present in the JSON
    for (const field of requiredMainFields) {
      if (!jsonOutput[field]) {
        throw new Error(`Required main field missing: ${field}`);
      }
    }

    // Ensure all subfields for required main fields are present in the JSON
    for (const mainField of requiredMainFields) {
      const subfieldArray = subfields[mainField];
      if (subfieldArray) {
        for (const subfield of subfieldArray) {
          const fullSubfield = `${mainField}-${subfield}`;
          if (!jsonOutput[fullSubfield]) {
            throw new Error(`Required subfield missing: ${fullSubfield}`);
          }
        }
      }
    }

    // Return the parsed JSON output
    return jsonOutput;
  }

  // Function to check if a field is a subfield (e.g., "Desertéiert")
  isSubfield(field) {
    // Check if the field is present in the subfields (without main field prefix)
    return Object.values(subfields).flat().includes(field);
  }

  // Function to find the main field for a subfield
  findMainFieldForSubfield(subfield) {
    for (const mainField of Object.keys(subfields)) {
      if (subfields[mainField].includes(subfield)) {
        return mainField;
      }
    }
    return null; // Subfield not found in any main field
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
