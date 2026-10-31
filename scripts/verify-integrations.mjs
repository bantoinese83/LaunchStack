#!/usr/bin/env node
/**
 * Smoke-test external services using apps/web/.env.local (no secrets printed).
 * Usage: node scripts/verify-integrations.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve('apps/web/.env.local');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  console.error('Missing apps/web/.env.local — copy from .env.example first.');
  process.exit(1);
}

const checks = [];

async function check(name, fn) {
  try {
    const ok = await fn();
    checks.push({ name, ok: Boolean(ok) });
  } catch (err) {
    checks.push({ name, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}

await check('Supabase REST', async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.ok;
});

await check('Upstash Redis', async () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  const res = await fetch(`${url}/ping`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
});

await check('Brevo API', async () => {
  const key = process.env.BREVO_API_KEY;
  if (!key) return false;
  const res = await fetch('https://api.brevo.com/v3/account', {
    headers: { 'api-key': key, accept: 'application/json' },
  });
  return res.ok;
});

await check('Twilio account', async () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return false;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.ok;
});

await check('Stripe API', async () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  const res = await fetch('https://api.stripe.com/v1/balance', {
    headers: { Authorization: `Bearer ${key}` },
  });
  return res.ok;
});

await check('PostHog host', async () => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.posthog.com';
  if (!key) return false;
  const res = await fetch(`${host.replace(/\/$/, '')}/decide?v=3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, distinct_id: 'integration-verify' }),
  });
  return res.ok;
});

let failed = 0;
for (const c of checks) {
  const mark = c.ok ? 'OK' : 'FAIL';
  if (!c.ok) failed += 1;
  console.log(`${mark.padEnd(4)} ${c.name}${c.error ? ` — ${c.error}` : ''}`);
}

console.log(
  `\nConfigured: SENTRY_DSN=${process.env.SENTRY_DSN ? 'yes' : 'no'} TWILIO_FROM=${process.env.TWILIO_MESSAGING_FROM ? 'yes' : 'no'}`
);

process.exit(failed > 0 ? 1 : 0);
