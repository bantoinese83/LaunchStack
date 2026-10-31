#!/usr/bin/env node
/** Merge Stripe CLI config + optional webhook secret into apps/web/.env.local */
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const MYSTIC_ACCOUNT = 'acct_1UWSD7PAdrGJF3yl';

function parseStripeConfig(text) {
  const profiles = {};
  let current = null;
  for (const line of text.split('\n')) {
    const section = line.match(/^\[(.+)\]$/);
    if (section) {
      current = section[1];
      profiles[current] = {};
      continue;
    }
    if (!current || !line.includes('=')) continue;
    const i = line.indexOf('=');
    profiles[current][line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return profiles;
}

function pickProfile(profiles) {
  for (const [name, p] of Object.entries(profiles)) {
    if (p.account_id === MYSTIC_ACCOUNT && p.test_mode_api_key?.startsWith('sk_')) {
      return { name, ...p };
    }
  }
  for (const [name, p] of Object.entries(profiles)) {
    if (
      /mystic/i.test(p.display_name || '') ||
      /mystic/i.test(p.profile_name || '') ||
      /mystic/i.test(name)
    ) {
      if (p.test_mode_api_key?.startsWith('sk_')) return { name, ...p };
    }
  }
  const def = profiles.default || Object.values(profiles)[0];
  return def?.test_mode_api_key ? { name: 'default', ...def } : null;
}

function upsertEnv(path, entries) {
  let lines = [];
  try {
    lines = readFileSync(path, 'utf8').split('\n');
  } catch {
    lines = ['# Local environment'];
  }
  const keys = new Set(Object.keys(entries));
  const out = lines.map((line) => {
    const k = line.split('=')[0];
    if (keys.has(k)) {
      keys.delete(k);
      return `${k}=${entries[k]}`;
    }
    return line;
  });
  for (const k of keys) out.push(`${k}=${entries[k]}`);
  writeFileSync(path, out.join('\n').replace(/\n+$/, '\n') + '\n');
}

const configText = execSync('stripe config --list', { encoding: 'utf8' });
const profile = pickProfile(parseStripeConfig(configText));
if (!profile?.test_mode_api_key || !profile?.test_mode_pub_key) {
  console.error(
    'Stripe CLI: no test keys found. Run `stripe login` while Mystic Hair Co sandbox is selected, or add profile for',
    MYSTIC_ACCOUNT
  );
  process.exit(1);
}

console.log(`Using Stripe CLI profile "${profile.name}" (account ${profile.account_id || 'unknown'})`);

const baseEntries = {
  STRIPE_SECRET_KEY: profile.test_mode_api_key,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: profile.test_mode_pub_key,
};

upsertEnv('apps/web/.env.local', baseEntries);

// Mirror mobile-related + production URL defaults
const web = readFileSync('apps/web/.env.local', 'utf8');
const get = (key) => web.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1] ?? '';
upsertEnv('apps/mobile/.env', {
  EXPO_PUBLIC_SUPABASE_URL: get('NEXT_PUBLIC_SUPABASE_URL'),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  EXPO_PUBLIC_APP_URL: get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
  EXPO_PUBLIC_MYSTIC_WORKSPACE_ID: get('NEXT_PUBLIC_MYSTIC_WORKSPACE_ID'),
});

// Create or reuse webhook for production
const webhookUrl = 'https://mystic-hair-co.vercel.app/api/stripe/webhook';
const events = ['checkout.session.completed', 'invoice.payment_succeeded'];
let webhookSecret = '';
try {
  const listed = JSON.parse(
    execSync('stripe webhook_endpoints list --limit 20', {
      encoding: 'utf8',
      env: { ...process.env, STRIPE_API_KEY: profile.test_mode_api_key },
    })
  );
  const existing = listed.data?.find((w) => w.url === webhookUrl);
  if (existing) {
    console.log('Webhook endpoint already exists:', webhookUrl);
    // Secret not retrievable for existing — create new signing secret via CLI listen is local only
  } else {
    const created = JSON.parse(
      execSync(
        `stripe webhook_endpoints create --url=${JSON.stringify(webhookUrl)} ${events.map((e) => `--enabled-events ${e}`).join(' ')}`,
        { encoding: 'utf8', env: { ...process.env, STRIPE_API_KEY: profile.test_mode_api_key } }
      )
    );
    webhookSecret = created.secret || '';
    console.log('Created Stripe webhook endpoint');
  }
} catch (e) {
  console.warn('Webhook setup skipped:', e.message?.slice(0, 120));
}

if (webhookSecret) {
  upsertEnv('apps/web/.env.local', { STRIPE_WEBHOOK_SECRET: webhookSecret });
}

// Mystic prices
const priceScript = spawnSync(
  process.execPath,
  ['scripts/stripe-create-mystic-prices.mjs'],
  {
    env: { ...process.env, STRIPE_SECRET_KEY: profile.test_mode_api_key },
    encoding: 'utf8',
    cwd: process.cwd(),
  }
);
if (priceScript.status === 0 && priceScript.stdout) {
  for (const line of priceScript.stdout.trim().split('\n')) {
    const i = line.indexOf('=');
    if (i > 0) upsertEnv('apps/web/.env.local', { [line.slice(0, i)]: line.slice(i + 1) });
  }
  console.log('Stripe Mystic price IDs synced');
} else if (priceScript.stderr) {
  console.warn('Price creation:', priceScript.stderr.slice(0, 200));
}

console.log('Stripe keys written to apps/web/.env.local (secrets not printed).');
