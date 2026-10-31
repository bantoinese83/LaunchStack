#!/usr/bin/env node
/** Apply clipboard to env if it matches expected prefix. Usage: node apply-clipboard-env.mjs KEY prefix1,prefix2 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const key = process.argv[2];
const prefixes = (process.argv[3] || '').split(',').filter(Boolean);
const val = execSync('pbpaste', { encoding: 'utf8' }).replace(/\s+$/, '');
const ok = prefixes.some((p) => val.startsWith(p) || (p === 'https' && val.includes('upstash.io')));
if (!ok) {
  console.error(`Clipboard does not match ${prefixes.join('|')} (got ${val.slice(0, 12)}…)`);
  process.exit(1);
}
execSync(`printf %s ${JSON.stringify(val)} | node scripts/set-env-key.mjs --key ${key}`, {
  stdio: 'inherit',
});
console.log(`Applied ${key}`);
