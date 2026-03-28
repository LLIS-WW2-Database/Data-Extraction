const { BaseOutputDirectory } = require('./createOutputDir');
const DocxToImageConverter = require('./docxToImage');
const DocxConverter = require('./docxToTxt');
const {
  wait,
  processBatch,
  walkthrough,
  copyFilesToAllDirectory,
  deleteOutputsFolder,
} = require('./generalFunctions');
const TxtToJsonConverter = require('./txtToJson');
const { loopOverFiles } = require('./utils');
const { mapWithConcurrency } = require('./concurrency');

module.exports = {
  BaseOutputDirectory,
  DocxToImageConverter,
  DocxConverter,
  copyFilesToAllDirectory,
  deleteOutputsFolder,
  processBatch,
  walkthrough,
  wait,
  mapWithConcurrency,
  TxtToJsonConverter,
  loopOverFiles,
};

