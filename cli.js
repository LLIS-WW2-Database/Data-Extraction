const path = require('path');
const DataConverter = require('./index');

function parseArgs(argv) {
  const args = {
    clean: false,
    concurrency: 1,
    inputDir: null,
    interactive: true,
    limit: null,
    logLevel: 'info',
    manifest: null,
    outputDir: null,
    report: null,
    resume: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--clean') {
      args.clean = true;
      continue;
    }

    if (arg === '--non-interactive') {
      args.interactive = false;
      continue;
    }

    if (arg === '--input-dir') {
      args.inputDir = argv[i + 1] || null;
      args.interactive = false;
      i += 1;
      continue;
    }

    if (arg === '--output-dir') {
      args.outputDir = argv[i + 1] || null;
      args.interactive = false;
      i += 1;
      continue;
    }

    if (arg === '--limit') {
      const value = Number.parseInt(argv[i + 1], 10);
      if (!Number.isNaN(value)) {
        args.limit = value;
        args.interactive = false;
        i += 1;
      }
      continue;
    }

    if (arg === '--report') {
      args.report = argv[i + 1] || null;
      args.interactive = false;
      i += 1;
      continue;
    }

    if (arg === '--manifest') {
      args.manifest = argv[i + 1] || null;
      args.interactive = false;
      i += 1;
      continue;
    }

    if (arg === '--resume') {
      args.resume = true;
      args.interactive = false;
      continue;
    }

    if (arg === '--concurrency') {
      const value = Number.parseInt(argv[i + 1], 10);
      if (!Number.isNaN(value) && value > 0) {
        args.concurrency = value;
        args.interactive = false;
        i += 1;
      }
      continue;
    }

    if (arg === '--log-level') {
      args.logLevel = argv[i + 1] || 'info';
      args.interactive = false;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const converter = new DataConverter({
    parentFolder: path.resolve(__dirname),
  });

  if (args.interactive) {
    await converter.walkthrough();
    return;
  }

  await converter.processBatch({
    clean: args.clean,
    concurrency: args.concurrency,
    inputDir: args.inputDir || undefined,
    limit: args.limit,
    logLevel: args.logLevel,
    manifestPath: args.manifest || undefined,
    outputDir: args.outputDir || undefined,
    reportPath: args.report || undefined,
    resume: args.resume,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
