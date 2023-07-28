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
const readline = require('readline');

const DocxConverter = require('./docxToTxt');
const TxtToJsonConverter = require('./txtToJson.js');
const DocxToImageConverter = require('./docxToImage');
const { BaseOutputDirectory } = require('./createOutputDir');
const info = chalk.keyword('yellow');

const outputsFolderPath = path.join(__dirname, '../Files/outputs');

function copyFilesToAllDirectory() {
  const outputDir = path.join(__dirname, '../Files/outputs');
  const txtDir = path.join(outputDir, 'txt');
  const jsonDir = path.join(outputDir, 'json');
  const imagesDir = path.join(outputDir, 'images');
  const allDir = path.join(outputDir, 'all');

  if (!fs.existsSync(allDir)) {
    fs.mkdirSync(allDir);
  }

  fs.readdir(txtDir, (err, txtFiles) => {
    if (err) {
      console.error('Error reading txt folder:', err);
      return;
    }

    txtFiles.forEach((txtFile) => {
      const personName = txtFile.split('.')[0];
      const personDir = path.join(allDir, personName);
      if (!fs.existsSync(personDir)) {
        fs.mkdirSync(personDir);
      }

      const txtFilePath = path.join(txtDir, txtFile);
      const destTxtFilePath = path.join(personDir, txtFile);
      fs.copyFileSync(txtFilePath, destTxtFilePath);

      const jsonFile = `${personName}.json`;
      const jsonFilePath = path.join(jsonDir, jsonFile);
      const destJsonFilePath = path.join(personDir, jsonFile);
      fs.copyFileSync(jsonFilePath, destJsonFilePath);

      const personImageDir = path.join(imagesDir, personName);
      if (fs.existsSync(personImageDir)) {
        const destPersonImageDir = path.join(personDir, 'images');
        if (!fs.existsSync(destPersonImageDir)) {
          fs.mkdirSync(destPersonImageDir);
        }
        fs.readdirSync(personImageDir).forEach((imageFile) => {
          const imagePath = path.join(personImageDir, imageFile);
          const destImagePath = path.join(destPersonImageDir, imageFile);
          fs.copyFileSync(imagePath, destImagePath);
        });
      }
    });

    console.log('Files copied to the "all" directory successfully.');
  });
}

async function deleteOutputsFolder() {
  try {
    // Check if the outputs folder exists
    const outputsFolderExists = await fs.pathExists(outputsFolderPath);

    if (outputsFolderExists) {
      // Delete the outputs folder and all its contents
      await fs.remove(outputsFolderPath);
      console.log('Outputs folder and its contents have been deleted.');
    } else {
      console.log('Outputs folder does not exist.');
    }
  } catch (err) {
    console.error('Error deleting outputs folder:', err);
  }
}

async function start() {
  // #region Functions within function
  async function createFolders() {
    await new BaseOutputDirectory(
      path.join(__dirname, '../'),
    ).createFileStructure();
  }

  async function verifyInputsAreThere() {
    await createFolders();
    const inputsFolderPath = path.join(__dirname, '../Files', 'inputs');

    return new Promise((resolve, reject) => {
      fs.readdir(inputsFolderPath, (err, files) => {
        if (err) {
          console.error('Error reading folder:', err);
          reject(err);
        } else {
          const docxFiles = files.filter(
            (file) => path.extname(file) === '.docx',
          );
          resolve(docxFiles.length > 0);
        }
      });
    });
  }

  async function convertEverything() {
    const mainPath = path.join(__dirname, '../');
    const docxConverter = new DocxConverter(mainPath);
    const txtToJsonConverter = new TxtToJsonConverter(mainPath);
    const docxToImageConverter = new DocxToImageConverter(mainPath);

    await createFolders();

    // Wait 5 seconds to ensure creation of folder
    // await wait(5 * 1000);

    console.log(info('Running Docx to Txt Conversion...'));
    await docxConverter.convertAllDocsToTxt();

    console.log(info('Running Txt to Json Conversion...'));
    await txtToJsonConverter.convertAllTxtToJson();

    console.log(info('Running Docx to Image Conversion...'));
    await docxToImageConverter.getAllImages();

    console.log(info('Copying Files to All Directory...'));
    await copyFilesToAllDirectory();
  }
  // #endregion

  // #region Prepare the Readline functionality and backend stuff
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // rl.on('close', () => {
  //    process.exit(0);
  // });
  // #endregion

  const promptContinue = chalk.red(
    'This action will delete the current "outputs" folder. Do you wish to continue (Y/N)? ',
  );
  const refreshInputs = chalk.red(
    'No DOCX files found in the Files/inputs folder.\nPlease add files, and then continue with y or cancel with n: ',
  );

  const result = await verifyInputsAreThere();

  // Wait 5 seconds before continuing
  await wait(5 * 1000);
  console.log(result);
  if (!result) {
    rl.setPrompt(refreshInputs);
    rl.prompt();

    rl.on('line', async (input) => {
      if (input.toLocaleLowerCase() == 'n') {
        console.log(chalk.red('Cancelling...'));
        rl.close();
        process.exit();
        return;
      } else if (input.toLocaleLowerCase() == 'y') {
        console.log(chalk.red('Checking intputs folder...'));
        const result2 = await verifyInputsAreThere();

        // Wait 5 seconds before continuing
        await wait(5 * 1000);

        if (!result2) {
          return rl.prompt();
        } else {
          await console.clear();
          await rl.close();
          start();
        }
      } else {
        rl.prompt();
      }
    });
  } else {
    // Ask for user input
    rl.setPrompt(promptContinue);
    rl.prompt();

    // Event listener for when the user enters a line of input
    rl.on('line', async (input) => {
      if (input.toLocaleLowerCase() == 'n') {
        console.log(chalk.red('Cancelling...'));
        rl.close();
        process.exit();
        return;
      } else if (input.toLocaleLowerCase() == 'y') {
        console.log(chalk.red('Deleting the outputs folder...'));
        await deleteOutputsFolder();
        await console.clear();
        console.log('Starting conversion...');
        convertEverything();
      } else {
        rl.prompt();
      }
    });
  }
  // #endregion
}

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

module.exports = {
  copyFilesToAllDirectory,
  deleteOutputsFolder,
  start,
};
