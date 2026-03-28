const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const DataConverter = require('../index');
const constants = require('../Constants');
const TxtToJsonConverter = require('../functions/txtToJson');

const repoRoot = path.resolve(__dirname, '..');
const sampleInputDir = path.join(repoRoot, 'Files', 'inputs');
const snapshotDir = path.join(__dirname, 'fixtures', 'snapshots');

test('parser preserves multiline values, aliases, and unattached text', () => {
  const converter = new TxtToJsonConverter(repoRoot, constants);
  const militaryField = constants.expectedMainFields.find((field) =>
    field.includes('Milit'),
  );
  const desertField = constants.subfields.Wehrmacht[0];
  const militaryAlias = constants.fieldAliases[militaryField][0];
  const desertAlias = constants.fieldAliases[desertField][0];
  const result = converter.parseDataToJSON(
    [
      'JANE DOE',
      'Loose note before any field',
      `${militaryAlias}: keine`,
      'Wehrmacht: Stationed in Cottbus',
      'continued service line',
      `${desertAlias}: 15.08.1943 in Luxembourg`,
      'hid with relatives',
    ].join('\n'),
    { fallbackName: 'Jane Doe' },
  );

  assert.equal(result.person.name, 'JANE DOE');
  assert.equal(result.fields[militaryField].value, 'keine');
  assert.equal(
    result.fields.Wehrmacht.value,
    'Stationed in Cottbus\ncontinued service line',
  );
  assert.equal(
    result.fields.Wehrmacht.subfields[desertField],
    '15.08.1943 in Luxembourg\nhid with relatives',
  );
  assert.deepEqual(result.parsing.unknownFields, []);
  assert.deepEqual(result.parsing.anomalies, [
    {
      line: 'JANE DOE',
      reason: 'unattached_text',
    },
    {
      line: 'Loose note before any field',
      reason: 'unattached_text',
    },
  ]);
});

test('batch mode supports custom dirs, snapshots, manifest output, and resume', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llis-db-batch-'));
  const inputDir = path.join(tempRoot, 'input');
  const outputDir = path.join(tempRoot, 'output');
  await fs.copy(sampleInputDir, inputDir);

  const converter = new DataConverter({
    parentFolder: repoRoot,
  });

  const firstRun = await converter.processBatch({
    clean: true,
    concurrency: 2,
    inputDir,
    outputDir,
  });

  assert.equal(firstRun.summary.processed, 3);
  assert.equal(firstRun.summary.succeeded, 3);
  assert.equal(firstRun.summary.skipped, 0);
  assert.equal(firstRun.benchmarks.concurrency, 2);
  assert.ok(firstRun.benchmarks.totalInputBytes > 0);

  const snapshotFiles = [
    'arendt-jean.json',
    'jung-joseph.json',
    'schanen-joseph.json',
  ];

  for (const fileName of snapshotFiles) {
    const actual = await fs.readJson(path.join(outputDir, 'json', fileName));
    const expected = await fs.readJson(path.join(snapshotDir, fileName));
    assert.deepEqual(actual, expected);
  }

  assert.ok(await fs.pathExists(path.join(outputDir, 'reports', 'run-report.json')));
  assert.ok(await fs.pathExists(path.join(outputDir, 'reports', 'run-manifest.json')));

  const secondRun = await converter.processBatch({
    concurrency: 2,
    inputDir,
    outputDir,
    resume: true,
  });

  assert.equal(secondRun.summary.processed, 0);
  assert.equal(secondRun.summary.skipped, 3);
  assert.equal(secondRun.summary.failed, 0);

  await fs.remove(tempRoot);
});
