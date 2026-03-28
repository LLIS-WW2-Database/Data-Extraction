const schemaVersion = '2.0.0';

const expectedMainFields = [
  'Vorname des Vaters',
  'Geburtsdatum',
  'Wohnort',
  'Land',
  'Geburtsort',
  'Geburtsland',
  'Religion',
  'Zivile Ausbildung',
  'Militärische Ausbildung',
  'Fräiwëllegekompanie',
  'Beruf',
  'Stellungsbefehl RAD',
  'RAD',
  'KHD',
  'Musterung',
  'Stellungsbefehl Wehrmacht',
  'Wehrmacht',
  'Erkennungsmarke N°',
  'Waffeneinheit',
  'Militärischer Rang bei der Gefangennahme',
  'Militärischer Dienst',
  'Art der Gefangennahme',
  'Datum der Gefangennahme',
  'Ort der Gefangennahme',
  'Land der Gefangennahme',
  'Nummer der Kriegsgefangenenlager',
  'Auf Brief an Stalin',
  'Auf Liste vom',
  'Abfahrtsliste vom',
  'Datum der Repatriierung',
  'Ankunft in Luxemburg',
  'Todesdatum',
  'Todesursache',
  'Nummer des Kriegsgefangenenlagers, wo er starb',
  'Nummer der Grablage',
  'Nummer der Personalakte im Archiv in Moskau',
  'Kontrollnummer vom Bearbeiter (Paul Dostert)',
  'Gestorben',
  'Lescht „mise à jour“',
  'Lescht Meldung',
];

const subfields = {
  Wehrmacht: ['Desertéiert', 'Verstoppt'],
};

const requiredMainFields = ['Name'];

const fieldAliases = {
  'Militärische Ausbildung': ['MilitÃ¤rische Ausbildung'],
  Fräiwëllegekompanie: ['FrÃ¤iwÃ«llegekompanie'],
  'Erkennungsmarke N°': ['Erkennungsmarke NÂ°'],
  'Lescht „mise à jour“': ['Lescht â€žmise Ã  jourâ€œ', 'Lescht „mise à jour“ '],
  'Lescht Meldung': ['Lescht Meldung '],
  Desertéiert: ['DesertÃ©iert'],
};

module.exports = {
  expectedMainFields,
  fieldAliases,
  requiredMainFields,
  schemaVersion,
  subfields,
};
