// Array of expected main fields (some are required)
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
    'Lescht Meldung'
]; // Add expected main fields here

// Object of subfields for main fields that require them
const subfields = {
    Wehrmacht: ['Desertéiert', 'Verstoppt'], // Example: Subfields for 'Wehrmacht'
};

// Array of required main fields
const requiredMainFields = ['Name']; // Add the required main fields here

module.exports = {
    expectedMainFields,
    subfields,
    requiredMainFields
}