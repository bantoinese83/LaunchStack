#!/usr/bin/env node
/**
 * Prints Google Cloud links for Mystic Maps setup (no secrets).
 */
const project = process.env.GOOGLE_CLOUD_PROJECT || 'mystic-hair-co';
const base = `https://console.cloud.google.com`;

const links = [
  ['Maps overview', `${base}/google/maps-apis/overview?project=${project}`],
  ['Enable APIs', `${base}/apis/library/browse?project=${project}&q=maps`],
  ['Keys & credentials', `${base}/google/maps-apis/credentials?project=${project}`],
  ['Map IDs (optional branding)', `${base}/google/maps-apis/studio/maps?project=${project}`],
];

console.log('\nMystic Hair Co. — Google Maps setup\n');
for (const [label, url] of links) {
  console.log(`${label}:\n  ${url}\n`);
}
console.log('Then add to apps/web/.env.local:');
console.log('  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...');
console.log('  GOOGLE_MAPS_GEOCODING_KEY=...');
console.log('\nFull guide: docs/client/GOOGLE-MAPS.md\n');
