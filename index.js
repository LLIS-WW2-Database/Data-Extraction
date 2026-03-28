/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const defaultConstants = require('./Constants');
const {
  BaseOutputDirectory,
  DocxConverter,
  DocxToImageConverter,
  processBatch,
  TxtToJsonConverter,
  copyFilesToAllDirectory,
  deleteOutputsFolder,
  loopOverFiles,
  walkthrough,
  wait,
} = require('./functions');

class DataConverter {
  /**
   * @param {Object} dataConverterOptions
   * @param {string} [dataConverterOptions.parentFolder]
   * @param {Object} [dataConverterOptions.constants]
   */
  constructor(dataConverterOptions = {}) {
    const { constants = defaultConstants, parentFolder = __dirname } =
      dataConverterOptions;

    this.constants = constants;
    this.parentFolder = parentFolder;

    this.baseOutputDirectory = new BaseOutputDirectory(this.parentFolder);
    this.docxConverter = new DocxConverter(this.parentFolder);
    this.docxToImageConverter = new DocxToImageConverter(this.parentFolder);
    this.txtToJsonConverter = new TxtToJsonConverter(
      this.parentFolder,
      this.constants,
    );
  }

  createFileStructure() {
    return this.baseOutputDirectory.createFileStructure();
  }

  copyFilesToAllDirectory() {
    return copyFilesToAllDirectory(this.parentFolder);
  }

  deleteOutputsFolder() {
    return deleteOutputsFolder(this.parentFolder);
  }

  loopOverFiles(inputFolderPath) {
    return loopOverFiles(inputFolderPath);
  }

  walkthrough() {
    return walkthrough({
      constants: this.constants,
      parentFolder: this.parentFolder,
    });
  }

  processBatch(options = {}) {
    return processBatch({
      ...options,
      constants: this.constants,
      parentFolder: this.parentFolder,
    });
  }

  wait(time) {
    return wait(time);
  }
}

module.exports = DataConverter;
