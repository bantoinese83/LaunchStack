#!/usr/bin/env node
/** Prints Google + Supabase redirect URIs for Mystic Hair Co. */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const webEnv = { ...readEnv(join(root, '.env.local')), ...readEnv(join(root, 'apps/web/.env.local')) };
const supabaseUrl =
  webEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://ipwubzqckiubrvrouzye.supabase.co';
const appUrl = webEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const projectRef = supabaseUrl.replace(/^https:\/\//, '').split('.')[0];

console.log('\n=== Google Cloud → OAuth client (Web) ===\n');
console.log('Authorized redirect URI (required, single Supabase callback):');
console.log(`  ${supabaseUrl}/auth/v1/callback\n`);
console.log('Authorized JavaScript origins (examples):');
console.log(`  ${appUrl}`);
if (!appUrl.includes('localhost')) {
  console.log('  http://localhost:3000');
}
console.log('\n=== Supabase → Auth → URL Configuration ===\n');
console.log('Site URL:');
console.log(`  ${appUrl}\n`);
console.log('Additional redirect URLs:');
console.log(`  ${appUrl.replace(/\/$/, '')}/auth/callback`);
console.log('  mystichair://auth/callback');
console.log('\n=== Supabase → Auth → Providers → Google ===\n');
console.log('Paste Client ID + Secret from Google; enable provider.');
console.log(`Dashboard: https://supabase.com/dashboard/project/${projectRef}/auth/providers\n`);
