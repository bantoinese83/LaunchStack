#!/usr/bin/env node
/**
 * Push integration env vars from apps/web/.env.local (or path arg) to Vercel.
 * Usage: node scripts/push-env-to-vercel.mjs [path-to-env-file]
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const envPath = process.argv[2] || 'apps/web/.env.local';
const targets = ['production', 'preview', 'development'];
const text = readFileSync(envPath, 'utf8');
const vars = {};
for (const line of text.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 1) continue;
  const key = line.slice(0, i).trim();
  const val = line.slice(i + 1).trim();
  if (!key.startsWith('EXPO_')) vars[key] = val;
}

const cwd = 'apps/web';
for (const target of targets) {
  for (const [key, val] of Object.entries(vars)) {
    if (!val) continue;
    const sensitive =
      key.includes('SECRET') ||
      key.includes('SERVICE_ROLE') ||
      key.includes('TOKEN') ||
      key.includes('AUTH') ||
      key === 'BREVO_API_KEY' ||
      key === 'STRIPE_SECRET_KEY';
    const sensFlag = sensitive ? ' --sensitive' : '';
    execSync(`printf '%s' ${JSON.stringify(val)} | vercel env add ${key} ${target} --force${sensFlag}`, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`[${target}] ${key}`);
  }
}
