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

const defaultConstants = require('../Constants');
const DocxConverter = require('./docxToTxt');
const TxtToJsonConverter = require('./txtToJson');
const DocxToImageConverter = require('./docxToImage');
const { BaseOutputDirectory } = require('./createOutputDir');
const { Logger } = require('./logger');
const {
  addFileReport,
  createRunReport,
  finalizeRunReport,
  writeRunReport,
} = require('./reporting');
const { mapWithConcurrency } = require('./concurrency');
const {
  hashFile,
  loadManifest,
  saveManifest,
  shouldSkipFile,
} = require('./manifest');
const { derivePersonNameFromFilePath } = require('./normalization');
const { validateDocxInputs } = require('./utils');

function getInputsDirectory(parentFolder = path.join(__dirname, '../'), inputDir) {
  return inputDir || path.join(parentFolder, 'Files', 'inputs');
}

function getOutputsDirectory(parentFolder = path.join(__dirname, '../'), outputDir) {
  return outputDir || path.join(parentFolder, 'Files', 'outputs');
}

function getRunReportPath(parentFolder, outputDir, reportPath) {
  return (
    reportPath ||
    path.join(getOutputsDirectory(parentFolder, outputDir), 'reports', 'run-report.json')
  );
}

function getManifestPath(parentFolder, outputDir, manifestPath) {
  return (
    manifestPath ||
    path.join(getOutputsDirectory(parentFolder, outputDir), 'reports', 'run-manifest.json')
  );
}

async function copyFilesToAllDirectory(
  parentFolder = path.join(__dirname, '../'),
  outputDir = getOutputsDirectory(parentFolder),
) {
  const txtDir = path.join(outputDir, 'txt');
  const jsonDir = path.join(outputDir, 'json');
  const imagesDir = path.join(outputDir, 'images');
  const allDir = path.join(outputDir, 'all');

  const txtFiles = await fs.readdir(txtDir);
  await fs.ensureDir(allDir);

  for (const txtFile of txtFiles) {
    const personName = txtFile.split('.')[0];
    const personDir = path.join(allDir, personName);
    await fs.ensureDir(personDir);

    const txtFilePath = path.join(txtDir, txtFile);
    const destTxtFilePath = path.join(personDir, txtFile);
    await fs.copy(txtFilePath, destTxtFilePath, { overwrite: true });

    const jsonFile = `${personName}.json`;
    const jsonFilePath = path.join(jsonDir, jsonFile);
    const destJsonFilePath = path.join(personDir, jsonFile);
    if (await fs.pathExists(jsonFilePath)) {
      await fs.copy(jsonFilePath, destJsonFilePath, { overwrite: true });
    }

    const personImageDir = path.join(imagesDir, personName);
    if (await fs.pathExists(personImageDir)) {
      const destPersonImageDir = path.join(personDir, 'images');
      await fs.ensureDir(destPersonImageDir);
      await fs.copy(personImageDir, destPersonImageDir, { overwrite: true });
    }
  }
}

async function deleteOutputsFolder(
  parentFolder = path.join(__dirname, '../'),
  outputDir = getOutputsDirectory(parentFolder),
) {
  const outputsFolderPath = outputDir;
  const outputsFolderExists = await fs.pathExists(outputsFolderPath);

  if (outputsFolderExists) {
    await fs.remove(outputsFolderPath);
    console.log('Outputs folder and its contents have been deleted.');
  } else {
    console.log('Outputs folder does not exist.');
  }
}

async function writeReviewFile(parentFolder, personKey, fileReport) {
  const reviewDir = path.join(
    getOutputsDirectory(parentFolder, fileReport.outputDir),
    'review',
  );
  const reviewPath = path.join(reviewDir, `${personKey}.review.json`);
  await fs.ensureDir(reviewDir);
  await fs.writeFile(reviewPath, JSON.stringify(fileReport, null, 2), 'utf8');
}

async function processBatch(options = {}) {
  const {
    clean = false,
    concurrency = 1,
    constants = defaultConstants,
    inputDir,
    limit,
    logLevel = 'info',
    manifestPath,
    outputDir,
    parentFolder = path.join(__dirname, '../'),
    reportPath,
    resume = false,
  } = options;

  const resolvedInputDir = getInputsDirectory(parentFolder, inputDir);
  const resolvedOutputDir = getOutputsDirectory(parentFolder, outputDir);
  const resolvedReportPath = getRunReportPath(parentFolder, resolvedOutputDir, reportPath);
  const resolvedManifestPath = getManifestPath(
    parentFolder,
    resolvedOutputDir,
    manifestPath,
  );
  const logger = new Logger(logLevel);
  const baseOutputDirectory = new BaseOutputDirectory(parentFolder, {
    outputFolderPath: resolvedOutputDir,
  });

  if (clean) {
    await deleteOutputsFolder(parentFolder, resolvedOutputDir);
  }

  await baseOutputDirectory.createFileStructure();

  const validation = await validateDocxInputs(resolvedInputDir);
  const docxFiles = typeof limit === 'number'
    ? validation.validFiles.slice(0, limit)
    : validation.validFiles;
  const manifest = await loadManifest(resolvedManifestPath);

  const runReport = createRunReport({
    clean,
    concurrency,
    inputDir: resolvedInputDir,
    limit: typeof limit === 'number' ? limit : null,
    outputDir: resolvedOutputDir,
    resume,
  });
  runReport.benchmarks.totalInputBytes = docxFiles.reduce(
    (total, filePath) => total + (validation.fileStats[filePath]?.size || 0),
    0,
  );

  for (const invalidFile of validation.invalidFiles) {
    addFileReport(runReport, {
      errors: [invalidFile.reason],
      filePath: invalidFile.filePath,
      image: {
        failures: [],
      },
      missingRequiredFields: [],
      reviewRequired: true,
      status: 'failed',
      unknownFields: [],
    });
  }

  if (docxFiles.length === 0) {
    finalizeRunReport(runReport);
    writeRunReport(runReport, resolvedReportPath);
    return runReport;
  }

  const converterOptions = {
    inputFolderPath: resolvedInputDir,
    outputFolderPath: resolvedOutputDir,
    imageOutputFolderPath: path.join(resolvedOutputDir, 'images'),
    jsonOutputFolderPath: path.join(resolvedOutputDir, 'json'),
    txtInputFolderPath: path.join(resolvedOutputDir, 'txt'),
    txtOutputFolderPath: path.join(resolvedOutputDir, 'txt'),
  };
  const docxConverter = new DocxConverter(parentFolder, converterOptions);
  const txtToJsonConverter = new TxtToJsonConverter(parentFolder, constants, converterOptions);
  const docxToImageConverter = new DocxToImageConverter(parentFolder, converterOptions);

  const workItems = [];

  for (const docxFilePath of docxFiles) {
    const personKey = derivePersonNameFromFilePath(docxFilePath);
    const fileHash = await hashFile(docxFilePath);
    const manifestEntry = manifest.files[docxFilePath];
    const canSkip = await shouldSkipFile(manifestEntry, fileHash);

    if (canSkip) {
      addFileReport(runReport, {
        filePath: docxFilePath,
        image: manifestEntry.image || {
          failures: [],
        },
        outputs: manifestEntry.outputs || {},
        personKey,
        reviewRequired: false,
        skippedBecause: resume ? 'resume_manifest' : 'unchanged_manifest',
        status: 'skipped',
      });
      logger.info('Skipping unchanged file', {
        file: path.basename(docxFilePath),
      });
      continue;
    }

    workItems.push({
      docxFilePath,
      fileHash,
      personKey,
      size: validation.fileStats[docxFilePath]?.size || 0,
    });
  }

  const processedReports = await mapWithConcurrency(workItems, concurrency, async (item) => {
    const { docxFilePath, fileHash, personKey, size } = item;
    const fileStartedAt = Date.now();
    const fileReport = {
      errors: [],
      filePath: docxFilePath,
      hash: fileHash,
      image: {
        failures: [],
      },
      missingRequiredFields: [],
      outputs: {},
      outputDir: resolvedOutputDir,
      personKey,
      reviewRequired: false,
      size,
      status: 'success',
      unknownFields: [],
    };

    try {
      logger.info('Processing file', { file: path.basename(docxFilePath) });

      const txtResult = await docxConverter.convertDocToTxt(docxFilePath);
      const jsonResult = await txtToJsonConverter.convertTxtToJson(
        txtResult.outputFilePath,
        {
          sourceDocxFile: docxFilePath,
        },
      );
      const imageResult = await docxToImageConverter.extractImagesFromDocx(
        docxFilePath,
        personKey,
      );

      fileReport.outputs = {
        json: jsonResult.outputFilePath,
        txt: txtResult.outputFilePath,
      };
      fileReport.image = imageResult;
      fileReport.missingRequiredFields = jsonResult.jsonData.parsing.missingRequiredFields;
      fileReport.unknownFields = jsonResult.jsonData.parsing.unknownFields;
      fileReport.anomalies = jsonResult.jsonData.parsing.anomalies;
      fileReport.reviewRequired =
        fileReport.missingRequiredFields.length > 0 ||
        fileReport.unknownFields.length > 0 ||
        fileReport.anomalies.length > 0 ||
        fileReport.image.failures.length > 0;
      fileReport.durationMs = Date.now() - fileStartedAt;

      if (fileReport.reviewRequired) {
        await writeReviewFile(parentFolder, personKey, fileReport);
      }
    } catch (error) {
      fileReport.status = 'failed';
      fileReport.errors.push(error.message);
      fileReport.reviewRequired = true;
      logger.error('Failed to process file', {
        error: error.message,
        file: path.basename(docxFilePath),
      });
      await writeReviewFile(parentFolder, personKey, fileReport);
    }

    manifest.files[docxFilePath] = {
      completedAt: new Date().toISOString(),
      filePath: docxFilePath,
      hash: fileHash,
      image: fileReport.image,
      outputs: fileReport.outputs,
      personKey,
      reviewRequired: fileReport.reviewRequired,
      status: fileReport.status,
    };

    return fileReport;
  });

  for (const fileReport of processedReports) {
    addFileReport(runReport, fileReport);
  }

  await copyFilesToAllDirectory(parentFolder, resolvedOutputDir);
  finalizeRunReport(runReport);
  writeRunReport(runReport, resolvedReportPath);
  await saveManifest(resolvedManifestPath, manifest);

  logger.info('Batch processing finished', {
    failed: runReport.summary.failed,
    processed: runReport.summary.processed,
    reviewRequired: runReport.summary.reviewRequired,
    skipped: runReport.summary.skipped,
    succeeded: runReport.summary.succeeded,
  });

  return runReport;
}

async function walkthrough(options = {}) {
  const {
    constants = defaultConstants,
    parentFolder = path.join(__dirname, '../'),
  } = options;

  async function verifyInputsAreThere() {
    await new BaseOutputDirectory(parentFolder).createFileStructure();
    const validation = await validateDocxInputs(path.join(parentFolder, 'Files', 'inputs'));
    return validation.validFiles.length > 0;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptContinue = chalk.red(
    'This action will delete the current "outputs" folder. Do you wish to continue (Y/N)? ',
  );
  const refreshInputs = chalk.red(
    'No DOCX files found in the Files/inputs folder.\nPlease add files, and then continue with y or cancel with n: ',
  );

  const askQuestion = (question) =>
    new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim().toLocaleLowerCase());
      });
    });

  try {
    let result = await verifyInputsAreThere();

    while (!result) {
      const input = await askQuestion(refreshInputs);

      if (input === 'n') {
        console.log(chalk.red('Cancelling...'));
        return null;
      }

      if (input === 'y') {
        console.log(chalk.red('Checking inputs folder...'));
        result = await verifyInputsAreThere();
      }
    }

    console.clear();

    let shouldPrompt = true;
    while (shouldPrompt) {
      const input = await askQuestion(promptContinue);

      if (input === 'n') {
        console.log(chalk.red('Cancelling...'));
        shouldPrompt = false;
        return null;
      }

      if (input === 'y') {
        console.log(chalk.red('Deleting the outputs folder...'));
        console.clear();
        console.log('Starting conversion...');
        const runReport = await processBatch({
          clean: true,
          constants,
          parentFolder,
        });
        console.log('Conversion Completed');
        shouldPrompt = false;
        return runReport;
      }
    }
  } finally {
    rl.close();
  }
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
  processBatch,
  walkthrough,
  wait,
};
