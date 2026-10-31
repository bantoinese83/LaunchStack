#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'apps/web/.env.local';
let text = readFileSync(path, 'utf8');
const defaults = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://us.posthog.com',
  SENDER_EMAIL: 'mystichairmlabs@gmail.com',
  SENDER_NAME: 'Mystic Hair Co.',
};
for (const [k, v] of Object.entries(defaults)) {
  if (!new RegExp(`^${k}=.+`, 'm').test(text)) {
    text += `${k}=${v}\n`;
  }
}
writeFileSync(path, text);
// mobile mirror
const get = (key) => text.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1] ?? '';
const mobile = `# Generated\nNEXT_PUBLIC_SUPABASE_URL=${get('NEXT_PUBLIC_SUPABASE_URL')}\n`;
writeFileSync(
  'apps/mobile/.env',
  `# Mystic mobile env
EXPO_PUBLIC_SUPABASE_URL=${get('NEXT_PUBLIC_SUPABASE_URL')}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${get('NEXT_PUBLIC_SUPABASE_ANON_KEY')}
EXPO_PUBLIC_APP_URL=${get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}
EXPO_PUBLIC_MYSTIC_WORKSPACE_ID=${get('NEXT_PUBLIC_MYSTIC_WORKSPACE_ID')}
`
);
console.log('Applied env defaults (sender email, PostHog host).');
