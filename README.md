# Word Document Data Extractor

This project extracts structured data and embedded images from `.docx` records used by the Diekirch Military Museum workflow. It supports both the original interactive walkthrough and a non-interactive batch mode designed for larger imports.

## Requirements

- Node.js
- npm

Install dependencies with:

```bash
npm install
```

## Directory Layout

Default input and output paths live under `Files/`:

```text
Files/
  inputs/                 Source .docx files
  outputs/
    txt/                  Extracted text files
    json/                 Parsed JSON records
    images/               Extracted images grouped per record
    all/                  Consolidated per-record folders
    review/               Per-record review files for anomalies/failures
    reports/              Run report and manifest
```

## Usage

Interactive mode:

```bash
npm run start
```

Batch mode:

```bash
node cli.js --non-interactive --clean
```

Batch mode also activates automatically if you pass any batch flag such as `--input-dir` or `--resume`.

## Batch Flags

```text
--input-dir <path>      Override the default input directory
--output-dir <path>     Override the default output directory
--clean                 Remove the output directory before processing
--report <path>         Write the run report to a custom path
--manifest <path>       Write the manifest to a custom path
--limit <n>             Process only the first n valid .docx files
--resume                Reuse the manifest and skip unchanged successful files
--concurrency <n>       Process up to n files in parallel
--log-level <level>     debug, info, warn, or error
```

Example:

```bash
node cli.js ^
  --input-dir ".\\Files\\inputs" ^
  --output-dir ".\\Files\\outputs" ^
  --clean ^
  --concurrency 4 ^
  --resume
```

PowerShell example:

```powershell
node .\cli.js `
  --input-dir .\Files\inputs `
  --output-dir .\Files\outputs `
  --clean `
  --concurrency 4 `
  --resume
```

## Batch Behavior

- Input validation rejects non-files, empty files, and unsupported extensions before parsing.
- One bad file does not stop the run. Failures are recorded and the batch continues.
- A run report is written to `outputs/reports/run-report.json` by default.
- A manifest is written to `outputs/reports/run-manifest.json` by default.
- Review files are written to `outputs/review/` when a record fails or needs manual inspection.
- Re-running the batch with the same inputs skips unchanged successful files when the manifest and expected outputs are still present.

## Output Schema

Each JSON file contains:

- `schemaVersion`
- `person`
- `fields`
- `other`
- `parsing`
- `metadata`

High-level example:

```json
{
  "schemaVersion": "2.0.0",
  "person": {
    "name": "Example Person"
  },
  "fields": {
    "Wehrmacht": {
      "value": "Main field content",
      "subfields": {
        "Desertéiert": "Subfield content"
      }
    }
  },
  "other": "Unmapped trailing content",
  "parsing": {
    "anomalies": [],
    "missingRequiredFields": [],
    "unknownFields": []
  },
  "metadata": {
    "outputFileName": "example-person.json",
    "sourceTextFile": "example-person.txt",
    "sourceDocxFile": "example person.docx"
  }
}
```

## Run Report

The run report contains:

- batch options
- per-file status
- success and failure counts
- skipped count
- review-required count
- unknown field and image failure totals
- benchmark data such as elapsed time, average file time, throughput, concurrency, and total input bytes

## Recommended Workflow

1. Place source `.docx` files in the input directory.
2. Run a clean batch for the first import.
3. Review `outputs/reports/run-report.json`.
4. Inspect any files in `outputs/review/`.
5. Re-run with `--resume` for subsequent passes.
6. Consume the JSON files from `outputs/json/` or the consolidated folders in `outputs/all/`.

## Development

Lint the project:

```bash
npm run lint
```

Run automated tests:

```bash
npm test
```

The test suite includes parser behavior checks and snapshot-style batch output verification using the sample `.docx` fixtures already in the repository.

## License

MIT. See `LICENSE`.
