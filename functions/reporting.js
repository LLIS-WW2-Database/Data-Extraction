const fs = require('fs');
const path = require('path');

function createRunReport(options = {}) {
  return {
    startedAt: new Date().toISOString(),
    status: 'running',
    options,
    benchmarks: {
      averageFileMs: 0,
      concurrency: options.concurrency || 1,
      elapsedMs: 0,
      filesPerMinute: 0,
      skipped: 0,
      totalInputBytes: 0,
    },
    summary: {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      reviewRequired: 0,
      unknownFieldCount: 0,
      imageFailureCount: 0,
    },
    files: [],
  };
}

function addFileReport(runReport, fileReport) {
  runReport.files.push(fileReport);

  if (fileReport.status === 'skipped') {
    runReport.summary.skipped += 1;
    runReport.benchmarks.skipped += 1;
    return;
  }

  runReport.summary.processed += 1;
  runReport.summary.unknownFieldCount += (fileReport.unknownFields || []).length;
  runReport.summary.imageFailureCount += (fileReport.image?.failures || []).length;

  if (fileReport.status === 'success') {
    runReport.summary.succeeded += 1;
  } else {
    runReport.summary.failed += 1;
  }

  if (fileReport.reviewRequired) {
    runReport.summary.reviewRequired += 1;
  }
}

function finalizeRunReport(runReport) {
  const startedAt = new Date(runReport.startedAt).getTime();
  const finishedAt = Date.now();
  const elapsedMs = Math.max(0, finishedAt - startedAt);
  const processedFiles = runReport.summary.processed;

  runReport.finishedAt = new Date().toISOString();
  runReport.status = runReport.summary.failed > 0 ? 'completed_with_errors' : 'completed';
  runReport.benchmarks.elapsedMs = elapsedMs;
  runReport.benchmarks.averageFileMs = processedFiles > 0 ? Math.round(elapsedMs / processedFiles) : 0;
  runReport.benchmarks.filesPerMinute =
    elapsedMs > 0 ? Number(((processedFiles / elapsedMs) * 60000).toFixed(2)) : 0;
  return runReport;
}

function writeRunReport(runReport, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(runReport, null, 2), 'utf8');
}

module.exports = {
  addFileReport,
  createRunReport,
  finalizeRunReport,
  writeRunReport,
};
