#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const projectRef = 'ipwubzqckiubrvrouzye';
const raw = execSync(`supabase projects api-keys --project-ref ${projectRef} -o json 2>/dev/null`, {
  encoding: 'utf8',
});
const keys = JSON.parse(raw);
const anon = keys.find((k) => k.id === 'anon')?.api_key;
const service = keys.find((k) => k.id === 'service_role')?.api_key;
if (!anon || !service) {
  console.error('Could not read anon/service_role from Supabase CLI');
  process.exit(1);
}

const base = `https://${projectRef}.supabase.co`;
const workspace = '33333333-3333-3333-3333-333333333333';

function upsertFile(path, entries) {
  let lines = [];
  try {
    lines = readFileSync(path, 'utf8').split('\n');
  } catch {
    lines = ['# Local environment — do not commit'];
  }
  const pending = new Map(Object.entries(entries));
  const out = lines.map((line) => {
    if (!line || line.startsWith('#')) return line;
    const i = line.indexOf('=');
    if (i < 1) return line;
    const k = line.slice(0, i);
    if (pending.has(k)) {
      const v = pending.get(k);
      pending.delete(k);
      return `${k}=${v}`;
    }
    return line;
  });
  for (const [k, v] of pending) out.push(`${k}=${v}`);
  writeFileSync(path, out.join('\n').replace(/\n+$/, '\n') + '\n');
}

const shared = {
  NEXT_PUBLIC_SUPABASE_URL: base,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: service,
  NEXT_PUBLIC_MYSTIC_WORKSPACE_ID: workspace,
  EXPO_PUBLIC_SUPABASE_URL: base,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: anon,
  EXPO_PUBLIC_MYSTIC_WORKSPACE_ID: workspace,
};

upsertFile('apps/web/.env.local', {
  ...shared,
  NEXT_PUBLIC_APP_URL: readFileSync('apps/web/.env.local', 'utf8').match(/^NEXT_PUBLIC_APP_URL=(.*)$/m)?.[1] || 'http://localhost:3000',
  SENDER_NAME: 'Mystic Hair Co.',
});

const webAppUrl =
  readFileSync('apps/web/.env.local', 'utf8').match(/^NEXT_PUBLIC_APP_URL=(.*)$/m)?.[1] ||
  'http://localhost:3000';

upsertFile('apps/mobile/.env', {
  ...shared,
  EXPO_PUBLIC_APP_URL: webAppUrl,
});

console.log('Merged Supabase keys into apps/web/.env.local and apps/mobile/.env (other vars preserved).');
