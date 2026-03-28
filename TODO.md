# TODO

This project works for the current sample set, but it still needs substantial hardening before it can reliably process hundreds or thousands of `.docx` files.

## High Priority

1. [x] Fix text encoding end to end.
The current pipeline still produces mojibake such as `MilitÃ¤rische`. Normalize document text to UTF-8 consistently and add a cleanup layer for known broken character sequences.

2. [x] Replace fragile string matching with a normalization layer.
Field detection currently depends on exact label text from `Constants.js`. Add preprocessing that trims whitespace, standardizes punctuation and quotes, collapses spacing, and maps field aliases to canonical names.

3. [x] Preserve multiline values.
The parser currently handles `Field: value` lines best and drops many continuation lines. Attach follow-up lines to the current field instead of discarding them.

4. [x] Redesign the JSON schema.
Flattened keys such as `Wehrmacht-Desertéiert` are hard to maintain. Move toward nested JSON structures that reflect the source data more clearly.

5. [x] Add per-file error reporting.
Warnings written only to stdout are not enough for large runs. Generate a machine-readable report that records successes, failures, missing required fields, and unknown fields for each file.

6. [x] Make batch processing resilient.
One bad file should not stop the whole run. Continue processing, log the failure, and summarize all issues at the end.

## Scalability

7. [x] Add a non-interactive batch mode.
The current interactive CLI flow is not suitable for large imports. Support flags such as `--input-dir`, `--output-dir`, `--clean`, `--report`, `--limit`, and `--resume`.

8. [x] Add concurrency controls.
Hundreds of `.docx` files should not all process at once. Use a bounded worker queue for text extraction, image extraction, and JSON conversion.

9. [x] Make processing idempotent.
Repeated runs should produce the same outputs and skip unchanged files safely. Add hashing or modified-time checks.

10. [x] Support resumable runs.
Large jobs should be restartable without reprocessing everything. Store file-level progress in a manifest.

11. [x] Add performance benchmarks.
Measure runtime, memory use, and throughput so bottlenecks are known before the archive size grows.

## Data Quality

12. [x] Validate input files before processing.
Reject or quarantine non-`.docx`, corrupt, empty, or unsupported files before they reach the parser.

13. [x] Track unknown fields centrally.
Do not only print `Unexpected field`. Collect unknown labels into a report so mappings can be improved systematically.

14. [x] Add a review queue for low-confidence outputs.
Some records will need manual validation. Mark files with missing fields, parsing anomalies, or unexpected structures for review.

15. [x] Improve image extraction validation.
Record extracted image counts, file types, and failures so image loss is visible instead of silent.

16. [x] Version the extraction schema.
If this feeds another system later, schema changes need explicit versioning to avoid breaking downstream consumers.

## Developer Experience

17. [x] Separate library code from CLI code.
Keep conversion logic reusable and isolate prompt handling or command-line orchestration in a dedicated entry script.

18. [x] Add automated parser tests.
Use representative fixtures for clean documents, malformed documents, missing fields, multiline sections, and field variations.

19. [x] Add snapshot tests for JSON output.
Approved output fixtures will make parser regressions obvious when extraction logic changes.

20. [x] Improve filename handling.
The current name extraction assumes the first two words in the filename belong to the person. Add safer parsing and fallback behavior.

21. [x] Add structured logging.
Replace ad hoc console output with log levels and per-file context so large runs are searchable and diagnosable.

22. [x] Expand the README for batch operations.
Document the expected directory layout, CLI usage, output schema, failure behavior, and recommended workflow for large imports.

## Next Phase: SQL And Website Readiness

23. Design a relational schema for the extracted data.
Define tables such as `person`, `source_document`, `source_image`, `military_service_period`, `capture_event`, `repatriation_event`, `death_event`, and a raw field/provenance table so the website can query structured facts cleanly.

24. Introduce stable internal field IDs.
Stop using human-facing label strings as the long-term canonical keys. Use database-safe identifiers such as `military_training`, `death_date`, and `death_place`, and map source labels onto them during normalization.

25. Preserve provenance for every extracted value.
Store the source document, original field label, raw extracted text, normalized value, and review state so bad imports can be audited and corrected later.

26. Split extraction from database import.
Keep the extractor responsible for producing stable intermediate JSON, then add a separate validation/import stage that loads SQL only after the data passes schema checks.

27. Parse typed values instead of storing only text blobs.
Convert dates, places, yes/no values, repeated events, and similar fields into structured values that can be indexed and queried in SQL.

28. Reduce dependence on large free-text fields.
Important facts are still trapped in fields like `other`, `RAD`, `Wehrmacht`, and `Gestorben`. Add targeted parsing so this information becomes structured data instead of opaque text.

29. Fix semantic extraction gaps before database import.
Current outputs still contain truncated or weak values such as `Gestorben: "in"` and `RAD: "Lager in"`. These parser quality issues should be resolved before treating the data as production-ready.

30. Replace mojibake field definitions in configuration.
`Constants.js` still contains broken character sequences in canonical field names. Clean those definitions so the configuration itself is stable and maintainable.

31. Add a record review workflow.
Support statuses such as `auto_accepted`, `needs_review`, `reviewed`, and `rejected` so questionable records can be handled safely before publication.

32. Add deterministic source and record identifiers.
Each source document and extracted person record should have a stable external key so reruns, imports, website URLs, and cross-references remain consistent.

33. Build a database importer with idempotent upserts.
Add a dedicated import command that loads the normalized JSON into SQL, supports dry runs, and safely updates existing rows without creating duplicates.

34. Add integration tests against a real database.
Test insert, update, duplicate handling, re-import behavior, and migration safety using an actual local SQL database instead of JSON-only verification.
