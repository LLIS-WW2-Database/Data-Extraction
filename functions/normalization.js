const path = require('path');

const MOJIBAKE_REPLACEMENTS = new Map([
  ['Ã¤', 'ä'],
  ['Ã„', 'Ä'],
  ['Ã«', 'ë'],
  ['Ã‰', 'É'],
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ã¶', 'ö'],
  ['Ã–', 'Ö'],
  ['Ã¼', 'ü'],
  ['Ãœ', 'Ü'],
  ['ÃŸ', 'ß'],
  ['Ã ', 'à'],
  ['â€œ', '“'],
  ['â€ž', '„'],
  ['â€', '”'],
  ['â€™', '’'],
  ['â€“', '–'],
  ['â€”', '—'],
  ['â€¢', '•'],
  ['Â°', '°'],
  ['Âº', 'º'],
  ['Â', ''],
]);

function cleanupMojibake(value = '') {
  let cleaned = String(value);
  let previous;
  let attempts = 0;

  do {
    previous = cleaned;
    for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS.entries()) {
      cleaned = cleaned.split(broken).join(fixed);
    }
    attempts += 1;
  } while (cleaned !== previous && attempts < 5);

  if (cleaned.includes('Ã') || cleaned.includes('â€')) {
    for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS.entries()) {
      cleaned = cleaned.split(broken).join(fixed);
    }
  }

  return cleaned.normalize('NFC');
}

function normalizeWhitespace(value = '') {
  return cleanupMojibake(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ ]*\n[ ]*/g, '\n')
    .trim();
}

function normalizeLabel(value = '') {
  return normalizeWhitespace(value)
    .replace(/[„“"']/g, '\'')
    .replace(/[’]/g, '\'')
    .replace(/[–—]/g, '-')
    .replace(/\s*:\s*$/g, '')
    .toLocaleLowerCase();
}

function buildAliasLookup(constants) {
  const aliasLookup = new Map();
  const subfields = Object.values(constants.subfields || {}).flat();

  for (const field of [...(constants.expectedMainFields || []), ...subfields]) {
    aliasLookup.set(normalizeLabel(field), field);
  }

  for (const [canonical, aliases] of Object.entries(constants.fieldAliases || {})) {
    aliasLookup.set(normalizeLabel(canonical), canonical);
    for (const alias of aliases) {
      aliasLookup.set(normalizeLabel(alias), canonical);
    }
  }

  return aliasLookup;
}

function slugifyName(value = '') {
  return normalizeWhitespace(value)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9äöüßàéèë' -]/gi, '')
    .replace(/[' ]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function derivePersonNameFromFilePath(filePath) {
  const baseName = cleanupMojibake(path.basename(filePath, path.extname(filePath)));
  const namePart = baseName
    .replace(/\s*-\s*fiche.*$/i, '')
    .replace(/\s+\d{4}.*$/i, '')
    .trim();

  if (!namePart) {
    return 'unknown-person';
  }

  return slugifyName(namePart);
}

module.exports = {
  buildAliasLookup,
  cleanupMojibake,
  derivePersonNameFromFilePath,
  normalizeLabel,
  normalizeWhitespace,
  slugifyName,
};
