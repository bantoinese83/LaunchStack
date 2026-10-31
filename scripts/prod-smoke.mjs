#!/usr/bin/env node
/**
 * Production smoke against mystic-hair-co.vercel.app
 * Usage: node scripts/prod-smoke.mjs
 * Requires apps/web/.env.local (Supabase, Stripe optional, Brevo, Twilio).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, 'apps/web/.env.local');

function loadEnv() {
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const PROD = process.env.PROD_BASE_URL ?? 'https://mystic-hair-co.vercel.app';
const DEMO_EMAIL = process.env.SMOKE_DEMO_EMAIL ?? 'demo@launchstack.com';
const DEMO_PASSWORD = process.env.SMOKE_DEMO_PASSWORD ?? 'LaunchStack!demo';
const VERIFIED_SMS = process.env.SMOKE_VERIFIED_PHONE ?? '+13802777256';
const WORKSPACE =
  process.env.NEXT_PUBLIC_MYSTIC_WORKSPACE_ID ?? '33333333-3333-3333-3333-333333333333';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function log(step, ok, detail = '') {
  const mark = ok ? 'OK' : 'FAIL';
  console.log(`[${mark}] ${step}${detail ? ` — ${detail}` : ''}`);
}

async function signInDemo() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? data.msg ?? 'Sign-in failed');
  return data.access_token;
}

async function adminFetch(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  return res;
}

function futureSlotIso() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 14);
  d.setUTCHours(18, 0, 0, 0);
  return d.toISOString();
}

async function api(path, token, init = {}) {
  const res = await fetch(`${PROD}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function sentryProbe(token) {
  const probeSecret = process.env.MYSTIC_SENTRY_PROBE_SECRET;
  if (!probeSecret) {
    log('Sentry (prod route)', true, 'skipped — set MYSTIC_SENTRY_PROBE_SECRET to enable');
    return;
  }
  const { res } = await fetch(`${PROD}/api/observability/sentry-check`, {
    headers: { 'x-mystic-probe': probeSecret, Authorization: `Bearer ${token}` },
  });
  log('Sentry (prod route)', res.status === 500, `HTTP ${res.status}`);
}

async function brevoRecent(toEmail) {
  const key = process.env.BREVO_API_KEY;
  if (!key) return null;
  const end = new Date();
  const start = new Date(end.getTime() - 15 * 60 * 1000);
  const url = new URL('https://api.brevo.com/v3/smtp/emails');
  url.searchParams.set('email', toEmail);
  url.searchParams.set('startDate', start.toISOString());
  url.searchParams.set('endDate', end.toISOString());
  url.searchParams.set('sort', 'desc');
  const res = await fetch(url, { headers: { 'api-key': key, accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.transactionalEmails ?? data.emails ?? [];
}

async function main() {
  console.log(`Production smoke → ${PROD}\n`);

  let token;
  try {
    token = await signInDemo();
    log('Supabase sign-in (demo studio user)', true, DEMO_EMAIL);
  } catch (e) {
    log('Supabase sign-in (demo studio user)', false, e.message);
    process.exit(1);
  }

  await sentryProbe(token);

  if (process.env.SMOKE_APPOINTMENT_ID) {
    await finishChecks(token, process.env.SMOKE_APPOINTMENT_ID);
    return;
  }

  const scheduledAt = futureSlotIso();
  const checkoutPayload = {
    serviceId: 'blowout',
    scheduledAt,
    address: {
      line1: '233 S Wacker Dr',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60606',
      notes: 'Prod smoke test — safe to cancel',
    },
    distanceMiles: 3,
    entitlement: 'none',
    quoteCents: 4500,
    surchargeJson: [],
    tipCents: 0,
    tags: [],
    policiesAccepted: true,
  };

  const { res: bookRes, body: bookBody } = await api('/api/mystic/checkout/booking', token, {
    method: 'POST',
    body: JSON.stringify(checkoutPayload),
  });

  if (!bookRes.ok) {
    log('Checkout booking API', false, `${bookRes.status} ${bookBody.error ?? ''}`);
    process.exit(1);
  }

  if (bookBody.mock) {
    log('Checkout booking API', true, 'credit/mock confirm (no Stripe URL)');
  } else if (bookBody.url) {
    log('Checkout booking API', true, `Stripe session created — open URL to pay`);
    console.log('\n--- STRIPE CHECKOUT (complete in browser, then re-run with SMOKE_APPOINTMENT_ID) ---');
    console.log(bookBody.url);
    console.log(`appointmentId: ${bookBody.appointmentId}\n`);
    if (!process.env.SMOKE_SKIP_STRIPE_WAIT) {
      process.exit(0);
    }
  } else {
    log('Checkout booking API', false, 'unexpected response');
    process.exit(1);
  }

  const appointmentId = bookBody.appointmentId;
  if (!appointmentId) {
    console.log('Missing appointmentId in checkout response.');
    process.exit(1);
  }

  console.log('\nAfter Stripe payment + webhook, run:');
  console.log(`SMOKE_APPOINTMENT_ID=${appointmentId} node scripts/prod-smoke.mjs\n`);
  process.exit(0);
}

async function finishChecks(token, appointmentId) {
  await new Promise((r) => setTimeout(r, 2000));

  const apptRes = await adminFetch(
    `mystic_appointments?id=eq.${appointmentId}&select=status,client_user_id`
  );
  const apptRows = await apptRes.json();
  const appt = apptRows?.[0];

  log(
    'Appointment confirmed in DB',
    appt?.status === 'confirmed',
    appt ? `status=${appt.status}` : 'not found'
  );

  const emails = await brevoRecent(DEMO_EMAIL);
  const confirmedMail = emails?.find((e) =>
    String(e.subject ?? e.templateName ?? '').toLowerCase().includes('confirm')
  );
  log(
    'Brevo confirmation email',
    Boolean(confirmedMail),
    confirmedMail ? confirmedMail.subject ?? 'sent' : 'no matching mail in last 15m (check spam / sender verify)'
  );

  if (appt?.client_user_id) {
    await adminFetch('mystic_client_profiles', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: appt.client_user_id,
        workspace_id: WORKSPACE,
        phone: VERIFIED_SMS,
        marketing_sms: true,
      }),
    });
  }

  const { res: routeRes, body: routeBody } = await api('/api/mystic/appointments/en-route', token, {
    method: 'POST',
    body: JSON.stringify({ appointmentId, etaMinutes: 12 }),
  });

  log(
    'Studio en-route SMS',
    routeRes.ok,
    routeRes.ok ? `eta 12m → ${VERIFIED_SMS}` : `${routeRes.status} ${routeBody.error ?? ''}`
  );

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
