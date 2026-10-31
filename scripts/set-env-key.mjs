#!/usr/bin/env node
/** Upsert KEY in apps/web/.env.local; mirror EXPO_* / shared keys to apps/mobile/.env */
import { readFileSync, writeFileSync } from 'node:fs';

const keyFlag = process.argv.indexOf('--key');
const key = keyFlag >= 0 ? process.argv[keyFlag + 1] : null;
if (!key) {
  console.error('Usage: echo -n "value" | node scripts/set-env-key.mjs --key VAR_NAME');
  process.exit(1);
}
const val = readFileSync(0, 'utf8').replace(/\n$/, '');

const MOBILE_ALIASES = {
  NEXT_PUBLIC_SUPABASE_URL: 'EXPO_PUBLIC_SUPABASE_URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  NEXT_PUBLIC_APP_URL: 'EXPO_PUBLIC_APP_URL',
  NEXT_PUBLIC_MYSTIC_WORKSPACE_ID: 'EXPO_PUBLIC_MYSTIC_WORKSPACE_ID',
};

function upsertFile(path, k, v) {
  let lines = [];
  try {
    lines = readFileSync(path, 'utf8').split('\n');
  } catch {
    lines = ['# Local environment'];
  }
  const prefix = `${k}=`;
  let found = false;
  const out = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true;
      return `${k}=${v}`;
    }
    return line;
  });
  if (!found) out.push(`${k}=${v}`);
  writeFileSync(path, out.join('\n').replace(/\n+$/, '\n') + '\n');
}

upsertFile('apps/web/.env.local', key, val);
if (key.startsWith('EXPO_')) {
  upsertFile('apps/mobile/.env', key, val);
} else if (MOBILE_ALIASES[key]) {
  upsertFile('apps/mobile/.env', MOBILE_ALIASES[key], val);
}

console.log(`set ${key}`);
