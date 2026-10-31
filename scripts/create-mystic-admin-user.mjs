#!/usr/bin/env node
/**
 * Creates a confirmed Supabase user with super_admin + Mystic studio owner.
 * Usage: node scripts/create-mystic-admin-user.mjs [email] [password]
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MYSTIC_WORKSPACE_ID = '33333333-3333-3333-3333-333333333333';

function loadEnv() {
  const paths = [
    resolve('apps/web/.env.local'),
    resolve('.env.local'),
  ];
  const env = { ...process.env };
  for (const path of paths) {
    try {
      for (const line of readFileSync(path, 'utf8').split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const i = line.indexOf('=');
        if (i < 1) continue;
        const key = line.slice(0, i).trim();
        let val = line.slice(i + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    } catch {
      /* skip missing file */
    }
  }
  return env;
}

function randomPassword() {
  const base = randomBytes(12).toString('base64url');
  return `Mystic!${base.slice(0, 10)}9`;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local');
  process.exit(1);
}

const email = process.argv[2] ?? `mystic.admin+${Date.now()}@mystichairco.dev`;
const password = process.argv[3] ?? randomPassword();
const fullName = 'Mystic Studio Admin';

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (createError) {
  console.error('createUser failed:', createError.message);
  process.exit(1);
}

const userId = created.user.id;

const { error: profileError } = await admin
  .from('profiles')
  .update({ system_role: 'super_admin', full_name: fullName })
  .eq('id', userId);

if (profileError) {
  console.error('profile update failed:', profileError.message);
  process.exit(1);
}

const { error: memberError } = await admin.from('workspace_members').upsert(
  {
    workspace_id: MYSTIC_WORKSPACE_ID,
    user_id: userId,
    role: 'workspace_owner',
  },
  { onConflict: 'workspace_id,user_id' }
);

if (memberError) {
  console.error('workspace_members failed:', memberError.message);
  process.exit(1);
}

console.log(JSON.stringify({ email, password, userId, roles: ['super_admin', 'workspace_owner'] }, null, 2));
