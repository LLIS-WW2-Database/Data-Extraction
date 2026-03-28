/**
 * Copyright 2023 Sebastian Mostert
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 */

const fs = require('fs');
const path = require('path');
const defaultConstants = require('../Constants');
const { BaseOutputDirectory } = require('./createOutputDir');
const { loopOverFiles } = require('./utils');
const {
  buildAliasLookup,
  cleanupMojibake,
  normalizeLabel,
  normalizeWhitespace,
} = require('./normalization');

class TxtToJsonConverter extends BaseOutputDirectory {
  constructor(parentFolder, constants = defaultConstants, options = {}) {
    super(parentFolder, options);
    this.inputFolderPath =
      options.txtInputFolderPath || path.join(this.outputFolderPath, 'txt');
    this.outputFolderPath =
      options.jsonOutputFolderPath || path.join(this.outputFolderPath, 'json');

    const {
      expectedMainFields,
      requiredMainFields,
      schemaVersion,
      subfields,
    } = constants;

    this.constants = constants;
    this.expectedMainFields = expectedMainFields;
    this.requiredMainFields = requiredMainFields;
    this.schemaVersion = schemaVersion || '1.0.0';
    this.subfields = subfields;
    this.aliasLookup = buildAliasLookup(constants);
    this.fieldCandidates = [
      ...this.expectedMainFields,
      ...Object.values(this.subfields).flat(),
      ...Object.entries(constants.fieldAliases || {}).flatMap(
        ([canonical, aliases]) => [canonical, ...aliases],
      ),
    ];
    this.ignoredLines = [
      'Victor Steichen',
      'viste@pt.lu',
    ].map((line) => normalizeLabel(line));
  }

  isSubfield(field) {
    return Object.values(this.subfields).flat().includes(field);
  }

  findMainFieldForSubfield(subfield) {
    for (const mainField of Object.keys(this.subfields)) {
      if (this.subfields[mainField].includes(subfield)) {
        return mainField;
      }
    }

    return null;
  }

  cleanText(text) {
    return normalizeWhitespace(text);
  }

  shouldIgnoreLine(line) {
    return this.ignoredLines.includes(normalizeLabel(line));
  }

  findEmbeddedFieldStart(line) {
    const cleanedLine = cleanupMojibake(line);
    let index = -1;

    for (const candidate of this.fieldCandidates) {
      const candidateIndex = cleanedLine.indexOf(`${cleanupMojibake(candidate)}:`);
      if (candidateIndex === -1) {
        continue;
      }

      if (index === -1 || candidateIndex < index) {
        index = candidateIndex;
      }
    }

    return index;
  }

  parseName(lines, fallbackName) {
    const firstMeaningfulLine = lines.find((line) => line.trim() !== '');

    if (!firstMeaningfulLine) {
      return fallbackName;
    }

    const fieldStart = this.findEmbeddedFieldStart(firstMeaningfulLine);
    const beforeField =
      fieldStart >= 0
        ? firstMeaningfulLine.slice(0, fieldStart)
        : firstMeaningfulLine;
    const cleaned = normalizeWhitespace(beforeField).replace(/\t/g, ' ');

    return cleaned || fallbackName;
  }

  setMainFieldValue(target, field, rawValue) {
    const value = normalizeWhitespace(rawValue);

    if (!target[field]) {
      target[field] = {
        value,
      };
      return;
    }

    const combined = [target[field].value, value].filter(Boolean).join('\n');
    target[field].value = normalizeWhitespace(combined);
  }

  appendSubfieldValue(target, mainField, subfield, rawValue) {
    const value = normalizeWhitespace(rawValue);

    if (!target[mainField]) {
      target[mainField] = {
        value: '',
        subfields: {},
      };
    }

    if (!target[mainField].subfields) {
      target[mainField].subfields = {};
    }

    const existing = target[mainField].subfields[subfield];
    target[mainField].subfields[subfield] = existing
      ? normalizeWhitespace(`${existing}\n${value}`)
      : value;
  }

  appendContinuation(target, currentFieldRef, line) {
    if (!currentFieldRef) {
      return false;
    }

    if (currentFieldRef.type === 'main') {
      this.setMainFieldValue(target, currentFieldRef.field, line);
      return true;
    }

    this.appendSubfieldValue(
      target,
      currentFieldRef.mainField,
      currentFieldRef.subfield,
      line,
    );
    return true;
  }

  parseDataToJSON(data, options = {}) {
    const cleanedData = cleanupMojibake(data).replace(/\r\n?/g, '\n');
    const lines = cleanedData.split('\n');
    const fallbackName = options.fallbackName || 'Unknown';
    const unknownFields = [];
    const anomalies = [];
    const fields = {};
    const otherLines = [];
    let currentFieldRef = null;
    let blankLineStreak = 0;
    let captureRemainingContent = false;
    let captureTailContent = false;

    const name = this.parseName(lines, fallbackName);

    for (let index = 0; index < lines.length; index++) {
      const originalLine = lines[index];
      const embeddedFieldStart =
        index === 0 ? this.findEmbeddedFieldStart(originalLine) : -1;
      const candidateLine =
        embeddedFieldStart > 0
          ? originalLine.slice(embeddedFieldStart)
          : originalLine;
      const line = candidateLine.trim();
      if (!line) {
        blankLineStreak += 1;
        if ((captureRemainingContent || captureTailContent) && otherLines.length > 0) {
          otherLines.push('');
        }
        continue;
      }

      if (captureRemainingContent) {
        if (!this.shouldIgnoreLine(line)) {
          otherLines.push(line);
        }
        blankLineStreak = 0;
        continue;
      }

      if (this.shouldIgnoreLine(line)) {
        blankLineStreak = 0;
        continue;
      }

      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) {
        if (captureTailContent) {
          if (!this.shouldIgnoreLine(line)) {
            otherLines.push(line);
          }
          blankLineStreak = 0;
          continue;
        }

        const appended =
          blankLineStreak <= 1 &&
          !/@/.test(line) &&
          this.appendContinuation(fields, currentFieldRef, line);
        if (!appended) {
          anomalies.push({
            line,
            reason: 'unattached_text',
          });
        }
        blankLineStreak = 0;
        continue;
      }

      const rawField = normalizeWhitespace(match[1]);
      const value = normalizeWhitespace(match[2]);
      const canonicalField = this.aliasLookup.get(normalizeLabel(rawField));

      if (!canonicalField) {
        unknownFields.push(rawField);
        currentFieldRef = null;
        blankLineStreak = 0;
        continue;
      }

      if (canonicalField === 'Name') {
        currentFieldRef = null;
        blankLineStreak = 0;
        continue;
      }

      if (this.expectedMainFields.includes(canonicalField)) {
        this.setMainFieldValue(fields, canonicalField, value);
        currentFieldRef = {
          field: canonicalField,
          type: 'main',
        };
        if (canonicalField === 'Gestorben') {
          captureTailContent = true;
        }
        if (canonicalField === 'Lescht „mise à jour“') {
          captureRemainingContent = true;
        }
        blankLineStreak = 0;
        continue;
      }

      if (this.isSubfield(canonicalField)) {
        const mainField = this.findMainFieldForSubfield(canonicalField);

        if (!mainField) {
          unknownFields.push(rawField);
          currentFieldRef = null;
          continue;
        }

        this.appendSubfieldValue(fields, mainField, canonicalField, value);
        currentFieldRef = {
          mainField,
          subfield: canonicalField,
          type: 'subfield',
        };
        blankLineStreak = 0;
        continue;
      }
    }

    const missingRequiredFields = this.requiredMainFields.filter((field) => {
      if (field === 'Name') {
        return !name;
      }

      return !fields[field] || !fields[field].value;
    });

    return {
      schemaVersion: this.schemaVersion,
      person: {
        name,
      },
      fields,
      other: otherLines.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
      parsing: {
        anomalies,
        missingRequiredFields,
        unknownFields: [...new Set(unknownFields)],
      },
    };
  }

  writeJSONToFile(jsonObj, filePath) {
    const jsonString = JSON.stringify(jsonObj, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
  }

  readTextFile(filePath) {
    return fs.promises.readFile(filePath, 'utf8');
  }

  async convertTxtToJson(txtFilePath, options = {}) {
    const fileText = await this.readTextFile(txtFilePath);
    const cleanedTxt = this.cleanText(fileText);
    const fallbackName = path.basename(txtFilePath, '.txt').replace(/-/g, ' ');
    const jsonData = this.parseDataToJSON(cleanedTxt, {
      fallbackName,
    });

    const name = path.basename(txtFilePath, '.txt');
    const fileName = `${name}.json`;
    const outputFilePath = path.join(this.outputFolderPath, fileName);

    jsonData.metadata = {
      outputFileName: fileName,
      sourceTextFile: path.basename(txtFilePath),
      ...(options.sourceDocxFile
        ? { sourceDocxFile: path.basename(options.sourceDocxFile) }
        : {}),
    };

    this.writeJSONToFile(jsonData, outputFilePath);

    return {
      jsonData,
      outputFilePath,
    };
  }

  async convertAllTxtToJson() {
    const txtFilePaths = await loopOverFiles(this.inputFolderPath);
    const results = [];

    for (const txtFilePath of txtFilePaths) {
      results.push(await this.convertTxtToJson(txtFilePath));
    }

    return results;
  }
}

module.exports = TxtToJsonConverter;
