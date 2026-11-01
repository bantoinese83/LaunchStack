#!/usr/bin/env node
/** Smoke localhost with admin credentials. Usage: node scripts/local-smoke.mjs */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, 'apps/web/.env.local');

function loadEnv() {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] ??= val;
  }
}

loadEnv();

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? 'mystic.studio.admin@mystichairco.dev';
const PASS = process.env.SMOKE_ADMIN_PASSWORD ?? 'MysticDemo!2026';

function log(ok, step, detail = '') {
  console.log(`[${ok ? 'OK' : 'FAIL'}] ${step}${detail ? ` — ${detail}` : ''}`);
}

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const tokenRes = await fetch(`${supabase}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const tokenJson = await tokenRes.json();
if (!tokenRes.ok) {
  log(false, 'Sign-in', tokenJson.error_description ?? tokenJson.msg);
  process.exit(1);
}
log(true, 'Sign-in', EMAIL);
const token = tokenJson.access_token;

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  return { status: res.status, json };
}

const checks = [
  ['GET', '/api/mystic/client-profile', null, (j) => j.profile?.email],
  ['GET', '/api/mystic/appointments/mine', null, (j) => Array.isArray(j.appointments)],
  ['GET', '/api/mystic/studio/access', null, (j) => j.allowed === true],
  ['GET', '/api/mystic/geocode/autocomplete?q=233%20Wacker%20Chicago', null, (j) =>
    (j.suggestions?.length ?? 0) > 0,
  ],
  [
    'POST',
    '/api/mystic/geocode/distance',
    { line1: '233 S Wacker Dr', city: 'Chicago', state: 'IL', postalCode: '60606' },
    (j) => typeof j.distanceMiles === 'number',
  ],
  ['GET', '/api/mystic/public/booking-settings', null, (j) => j.rules || j.depositCents],
];

let failed = 0;
for (const [method, path, body, assert] of checks) {
  const { status, json } = await api(method, path, body);
  const ok = status >= 200 && status < 300 && assert(json);
  if (!ok) failed++;
  log(ok, `${method} ${path}`, ok ? '' : `${status} ${json.error ?? JSON.stringify(json).slice(0, 80)}`);
}

for (const path of [
  '/account',
  '/book',
  '/visits',
  '/messages',
  '/memberships',
  '/shop',
  '/studio',
]) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  const ok = res.status === 200 || res.status === 307;
  if (!ok) failed++;
  log(ok, `PAGE ${path}`, String(res.status));
}

process.exit(failed ? 1 : 0);
