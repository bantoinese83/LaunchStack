#!/usr/bin/env node
/**
 * Populate remote Supabase with realistic Mystic demo data (studio + clients).
 *
 * Usage:
 *   node scripts/seed-mystic-demo-data.mjs
 *   node scripts/seed-mystic-demo-data.mjs mystic.studio.admin@mystichairco.dev 'YourPassword'
 *
 * Default password for all seeded accounts: MysticDemo!2026
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const require = createRequire(resolve('apps/web/package.json'));
const { createClient } = require('@supabase/supabase-js');

const MYSTIC_WORKSPACE_ID = '33333333-3333-3333-3333-333333333333';
const DEFAULT_PASSWORD = 'MysticDemo!2026';
const DEMO_MARKER = 'mystic-demo-seed-v1';

function loadEnv() {
  const env = { ...process.env };
  for (const path of [resolve('apps/web/.env.local'), resolve('.env.local')]) {
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
      /* missing */
    }
  }
  return env;
}

/** Build a UTC Date for Chicago local wall time (days relative to today in Chicago). */
function chicagoLocal(daysFromToday, hour, minute = 0) {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [y, m, d] = ymd.split('-').map(Number);
  const day = d + daysFromToday;
  const probe = new Date(Date.UTC(y, m - 1, day, 12, 0));
  const chicagoHourAtUtcNoon = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      hour12: false,
    }).format(probe)
  );
  const offsetHours = chicagoHourAtUtcNoon - 12;
  return new Date(Date.UTC(y, m - 1, day, hour - offsetHours, minute, 0));
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminEmail = process.argv[2] ?? 'mystic.studio.admin@mystichairco.dev';
const password = process.argv[3] ?? DEFAULT_PASSWORD;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // Paginate — small projects fit on first pages
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser({ email, fullName, password: pwd, avatarSeed }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: pwd,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(avatarSeed)}&size=256`,
      },
    });
    await admin
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(avatarSeed)}&size=256`,
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: pwd,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(avatarSeed)}&size=256`,
    },
  });
  if (error) throw error;
  await admin
    .from('profiles')
    .update({
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(avatarSeed)}&size=256`,
    })
    .eq('id', data.user.id);
  return data.user.id;
}

const CLIENTS = [
  {
    key: 'jordan',
    email: 'jordan.lee@mystichairco.dev',
    fullName: 'Jordan Lee',
    phone: '3125550141',
    referralCode: 'JORDANLEE',
    avatarSeed: 'jordan-lee',
    address: {
      line1: '405 N Wabash Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60611',
      notes: 'Doorman — ask for Jordan, unit 2204',
      latitude: 41.8895,
      longitude: -87.6263,
    },
  },
  {
    key: 'sam',
    email: 'sam.rivera@mystichairco.dev',
    fullName: 'Sam Rivera',
    phone: '3125550142',
    referralCode: 'SAMRIVERA',
    avatarSeed: 'sam-rivera',
    address: {
      line1: '600 N Fairbanks Ct',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60611',
      notes: 'Buzzer 4B — dog is friendly',
      latitude: 41.8928,
      longitude: -87.6201,
    },
  },
  {
    key: 'avery',
    email: 'avery.chen@mystichairco.dev',
    fullName: 'Avery Chen',
    phone: '3125550143',
    referralCode: 'AVERYCHEN',
    avatarSeed: 'avery-chen',
    address: {
      line1: '111 W Illinois St',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60654',
      notes: 'Street parking on Illinois; call on arrival',
      latitude: 41.8909,
      longitude: -87.6315,
    },
  },
  {
    key: 'morgan',
    email: 'morgan.patel@mystichairco.dev',
    fullName: 'Morgan Patel',
    phone: '3125550144',
    referralCode: 'MORGANPAT',
    avatarSeed: 'morgan-patel',
    address: {
      line1: '900 N Kingsbury St',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60610',
      notes: 'Loading dock entrance preferred',
      latitude: 41.8992,
      longitude: -87.6412,
    },
  },
  {
    key: 'casey',
    email: 'casey.brooks@mystichairco.dev',
    fullName: 'Casey Brooks',
    phone: '3125550145',
    referralCode: 'CASEYBRKS',
    avatarSeed: 'casey-brooks',
    address: {
      line1: '201 E Chestnut St',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60611',
      notes: 'Elevator to 12 — leave kit bag in foyer',
      latitude: 41.8981,
      longitude: -87.6224,
    },
  },
];

console.log('Seeding Mystic demo data…');

// Workspace + settings
{
  const { error } = await admin.from('workspaces').upsert(
    {
      id: MYSTIC_WORKSPACE_ID,
      name: 'Mystic Hair Co.',
      slug: 'mystic-hair-co',
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}
{
  const { error } = await admin.from('mystic_studio_settings').upsert(
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      winter_buffer_enabled: false,
      evening_surcharge_cents: 2500,
      included_miles: 5,
      per_mile_surcharge_cents: 500,
      deposit_cents: 2500,
      door_timer_minutes: 15,
      referral_reward_after: 5,
    },
    { onConflict: 'workspace_id' }
  );
  if (error) throw error;
}

const adminId = await ensureUser({
  email: adminEmail,
  fullName: 'Luke · Mystic Studio',
  password,
  avatarSeed: 'luke-mystic',
});

await admin
  .from('profiles')
  .update({ system_role: 'super_admin', full_name: 'Luke · Mystic Studio' })
  .eq('id', adminId);

{
  const { error } = await admin.from('workspace_members').upsert(
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      user_id: adminId,
      role: 'workspace_owner',
    },
    { onConflict: 'workspace_id,user_id' }
  );
  if (error) throw error;
}

const clientIds = {};
for (const c of CLIENTS) {
  const id = await ensureUser({
    email: c.email,
    fullName: c.fullName,
    password,
    avatarSeed: c.avatarSeed,
  });
  clientIds[c.key] = id;
  const { error } = await admin.from('mystic_client_profiles').upsert(
    {
      user_id: id,
      workspace_id: MYSTIC_WORKSPACE_ID,
      phone: c.phone,
      birthday: c.key === 'jordan' ? '1994-06-12' : c.key === 'sam' ? '1991-11-03' : null,
      marketing_sms: true,
      marketing_email: true,
      referral_code: c.referralCode,
      referral_count: c.key === 'jordan' ? 2 : 0,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

// Clear prior demo appointments/messages keyed by client_notes marker to keep re-runs clean
{
  const { data: oldAppts } = await admin
    .from('mystic_appointments')
    .select('id')
    .eq('workspace_id', MYSTIC_WORKSPACE_ID)
    .ilike('client_notes', `%${DEMO_MARKER}%`);
  const ids = (oldAppts ?? []).map((a) => a.id);
  if (ids.length) {
    await admin.from('mystic_messages').delete().in('appointment_id', ids);
    await admin.from('mystic_appointment_photos').delete().in('appointment_id', ids);
    await admin.from('mystic_appointments').delete().in('id', ids);
  }
  await admin
    .from('mystic_messages')
    .delete()
    .eq('workspace_id', MYSTIC_WORKSPACE_ID)
    .ilike('body', `%${DEMO_MARKER}%`);
}

const jordan = CLIENTS.find((c) => c.key === 'jordan');
const sam = CLIENTS.find((c) => c.key === 'sam');
const avery = CLIENTS.find((c) => c.key === 'avery');
const morgan = CLIENTS.find((c) => c.key === 'morgan');
const casey = CLIENTS.find((c) => c.key === 'casey');

const apptDefs = [
  {
    id: randomUUID(),
    client: 'jordan',
    service_id: 'blowout',
    starts_at: chicagoLocal(0, 11, 0).toISOString(),
    duration_minutes: 60,
    status: 'stylist_en_route',
    quote_cents: 9500,
    tip_cents: 1500,
    tags: ['open_to_chat'],
    distance_miles: 1.2,
    eta_minutes: 12,
    stylist_latitude: 41.891,
    stylist_longitude: -87.628,
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'membership',
    client_notes: `${DEMO_MARKER} Soft volume for a lunch meeting`,
  },
  {
    id: randomUUID(),
    client: 'sam',
    service_id: 'updo',
    starts_at: chicagoLocal(0, 14, 30).toISOString(),
    duration_minutes: 60,
    status: 'door_timer_active',
    quote_cents: 14500,
    tip_cents: 2000,
    tags: ['silent'],
    distance_miles: 2.1,
    door_timer_ends_at: new Date(Date.now() + 9 * 60_000).toISOString(),
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Wedding guest — soft romantic bun`,
  },
  {
    id: randomUUID(),
    client: 'avery',
    service_id: 'haircut',
    starts_at: chicagoLocal(1, 10, 0).toISOString(),
    duration_minutes: 60,
    status: 'confirmed',
    quote_cents: 12000,
    tip_cents: 1000,
    tags: ['need_sink_wash'],
    distance_miles: 0.8,
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'package',
    client_notes: `${DEMO_MARKER} Face-framing layers, keep length`,
  },
  {
    id: randomUUID(),
    client: 'morgan',
    service_id: 'blowout',
    starts_at: chicagoLocal(2, 16, 0).toISOString(),
    duration_minutes: 60,
    status: 'confirmed',
    quote_cents: 12000,
    tip_cents: 0,
    tags: ['running_late'],
    distance_miles: 3.4,
    surcharge_json: [{ code: 'evening', label: 'Evening surcharge', amountCents: 2500 }],
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Smooth blowout before dinner`,
  },
  {
    id: randomUUID(),
    client: 'casey',
    service_id: 'dry_style',
    starts_at: chicagoLocal(5, 9, 30).toISOString(),
    duration_minutes: 30,
    status: 'confirmed',
    quote_cents: 6500,
    tip_cents: 1000,
    tags: ['open_to_chat'],
    distance_miles: 1.6,
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Quick polish before photos`,
  },
  {
    id: randomUUID(),
    client: 'jordan',
    service_id: 'blowout',
    starts_at: chicagoLocal(-4, 13, 0).toISOString(),
    duration_minutes: 60,
    status: 'completed',
    quote_cents: 9500,
    tip_cents: 2000,
    tags: ['open_to_chat'],
    distance_miles: 1.2,
    payment_captured: true,
    deposit_cents: 2500,
    deposit_captured: false,
    entitlement: 'membership',
    client_notes: `${DEMO_MARKER} Previous visit — loved the soft wave`,
  },
  {
    id: randomUUID(),
    client: 'sam',
    service_id: 'blowout',
    starts_at: chicagoLocal(-10, 11, 0).toISOString(),
    duration_minutes: 60,
    status: 'completed',
    quote_cents: 9500,
    tip_cents: 1500,
    tags: [],
    distance_miles: 2.1,
    payment_captured: true,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Past blowout`,
  },
  {
    id: randomUUID(),
    client: 'morgan',
    service_id: 'blowout',
    starts_at: chicagoLocal(0, 17, 0).toISOString(),
    duration_minutes: 60,
    status: 'pending',
    quote_cents: 12000,
    tip_cents: 0,
    tags: [],
    distance_miles: 3.4,
    payment_captured: false,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Abandoned Stripe checkout hold`,
  },
  {
    id: randomUUID(),
    client: 'casey',
    service_id: 'haircut',
    starts_at: chicagoLocal(-2, 15, 0).toISOString(),
    duration_minutes: 60,
    status: 'canceled',
    quote_cents: 12000,
    tip_cents: 0,
    tags: [],
    distance_miles: 1.6,
    payment_captured: false,
    deposit_cents: 2500,
    entitlement: 'none',
    client_notes: `${DEMO_MARKER} Client canceled — schedule conflict`,
  },
];

const addressByKey = Object.fromEntries(CLIENTS.map((c) => [c.key, c.address]));
const apptRows = apptDefs.map((a) => ({
  id: a.id,
  workspace_id: MYSTIC_WORKSPACE_ID,
  client_user_id: clientIds[a.client],
  service_id: a.service_id,
  starts_at: a.starts_at,
  duration_minutes: a.duration_minutes,
  address: addressByKey[a.client],
  distance_miles: a.distance_miles,
  entitlement: a.entitlement,
  quote_cents: a.quote_cents,
  surcharge_json: a.surcharge_json ?? [],
  tip_cents: a.tip_cents,
  tags: a.tags,
  status: a.status,
  deposit_cents: a.deposit_cents,
  deposit_captured: a.deposit_captured ?? false,
  payment_captured: a.payment_captured,
  door_timer_ends_at: a.door_timer_ends_at ?? null,
  eta_minutes: a.eta_minutes ?? null,
  stylist_latitude: a.stylist_latitude ?? null,
  stylist_longitude: a.stylist_longitude ?? null,
  stylist_location_updated_at: a.stylist_latitude != null ? new Date().toISOString() : null,
  client_notes: a.client_notes,
}));

{
  const { error } = await admin.from('mystic_appointments').insert(apptRows);
  if (error) throw error;
}

const byClientService = (clientKey, serviceId, status) =>
  apptDefs.find((a) => a.client === clientKey && a.service_id === serviceId && a.status === status);

const msgRows = [
  {
    client: 'jordan',
    appointment: byClientService('jordan', 'blowout', 'stylist_en_route'),
    sender_role: 'client',
    body: `Hey Luke — buzzer is 2204 today. Excited for the soft volume! (${DEMO_MARKER})`,
    minutesAgo: 45,
  },
  {
    client: 'jordan',
    appointment: byClientService('jordan', 'blowout', 'stylist_en_route'),
    sender_role: 'stylist',
    body: `Got it — I'm about 12 min out, traffic's light on Wabash. See you soon. (${DEMO_MARKER})`,
    minutesAgo: 40,
  },
  {
    client: 'sam',
    appointment: byClientService('sam', 'updo', 'door_timer_active'),
    sender_role: 'stylist',
    body: `I'm downstairs — door timer started. Text if the elevator is slow. (${DEMO_MARKER})`,
    minutesAgo: 6,
  },
  {
    client: 'sam',
    appointment: byClientService('sam', 'updo', 'door_timer_active'),
    sender_role: 'client',
    body: `Coming! (${DEMO_MARKER})`,
    minutesAgo: 4,
  },
  {
    client: 'avery',
    appointment: byClientService('avery', 'haircut', 'confirmed'),
    sender_role: 'client',
    body: `Quick inspo note — keep the length, just soft layers around the face. Sink wash is ready. (${DEMO_MARKER})`,
    minutesAgo: 60 * 20,
  },
  {
    client: 'avery',
    appointment: byClientService('avery', 'haircut', 'confirmed'),
    sender_role: 'stylist',
    body: `Perfect — I'll bring the hose attachment. See you tomorrow at 10. (${DEMO_MARKER})`,
    minutesAgo: 60 * 18,
  },
  {
    client: 'morgan',
    appointment: byClientService('morgan', 'blowout', 'confirmed'),
    sender_role: 'client',
    body: `I might be 5–10 late from a meeting — still okay? (${DEMO_MARKER})`,
    minutesAgo: 60 * 5,
  },
  {
    client: 'morgan',
    appointment: byClientService('morgan', 'blowout', 'confirmed'),
    sender_role: 'stylist',
    body: `All good — I'll pad travel. Dining chair ready helps. (${DEMO_MARKER})`,
    minutesAgo: 60 * 4,
  },
];

{
  const rows = msgRows.map((m) => ({
    id: randomUUID(),
    workspace_id: MYSTIC_WORKSPACE_ID,
    client_user_id: clientIds[m.client],
    appointment_id: m.appointment?.id ?? null,
    sender_role: m.sender_role,
    sender_id: m.sender_role === 'stylist' ? adminId : clientIds[m.client],
    body: m.body,
    read_at: m.sender_role === 'stylist' ? new Date().toISOString() : null,
    created_at: new Date(Date.now() - m.minutesAgo * 60_000).toISOString(),
  }));
  const { error } = await admin.from('mystic_messages').insert(rows);
  if (error) throw error;
}

// Credits — Avery has package remaining; Jordan on membership
await admin.from('mystic_client_credits').delete().eq('workspace_id', MYSTIC_WORKSPACE_ID).in('user_id', [
  clientIds.avery,
  clientIds.jordan,
]);
{
  const { error } = await admin.from('mystic_client_credits').insert([
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      user_id: clientIds.avery,
      source_kind: 'package',
      source_id: 'pack_4',
      blowouts_remaining: 2,
      expires_at: chicagoLocal(90, 12).toISOString(),
    },
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      user_id: clientIds.jordan,
      source_kind: 'membership',
      source_id: 'glow',
      blowouts_remaining: 1,
      expires_at: chicagoLocal(25, 12).toISOString(),
      stripe_subscription_id: 'sub_demo_glow_jordan',
    },
  ]);
  if (error) throw error;
}

// Referrals for Jordan
await admin.from('mystic_referrals').delete().eq('workspace_id', MYSTIC_WORKSPACE_ID).eq('referrer_user_id', clientIds.jordan);
{
  const { error } = await admin.from('mystic_referrals').insert([
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      referrer_user_id: clientIds.jordan,
      referred_user_id: clientIds.sam,
      referred_name: sam.fullName,
      credited: true,
      created_at: chicagoLocal(-12, 10).toISOString(),
    },
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      referrer_user_id: clientIds.jordan,
      referred_user_id: clientIds.avery,
      referred_name: avery.fullName,
      credited: false,
      created_at: chicagoLocal(-3, 15).toISOString(),
    },
  ]);
  if (error) throw error;
}

// Block a travel day next week
{
  const block = chicagoLocal(7, 12);
  const ymd = block.toISOString().slice(0, 10);
  await admin
    .from('mystic_blocked_dates')
    .upsert(
      {
        workspace_id: MYSTIC_WORKSPACE_ID,
        block_date: ymd,
        reason: 'Personal travel day',
      },
      { onConflict: 'workspace_id,block_date' }
    );
}

// Studio blast history
await admin.from('mystic_blasts').delete().eq('workspace_id', MYSTIC_WORKSPACE_ID).ilike('body', `%${DEMO_MARKER}%`);
{
  const { error } = await admin.from('mystic_blasts').insert([
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      created_by: adminId,
      channel: 'sms',
      segment: 'upcoming_week',
      subject: null,
      body: `Reminder: wash + dry hair before your house call. Dining chair ready helps. — Luke (${DEMO_MARKER})`,
      status: 'sent',
      recipient_count: 4,
      sent_at: chicagoLocal(-1, 9).toISOString(),
    },
    {
      workspace_id: MYSTIC_WORKSPACE_ID,
      created_by: adminId,
      channel: 'email',
      segment: 'members',
      subject: 'Spring soft-wave season',
      body: `Members — book your next Glow blowout while evenings are still light. (${DEMO_MARKER})`,
      status: 'draft',
      recipient_count: 0,
    },
  ]);
  if (error) throw error;
}

const { count: apptCount } = await admin
  .from('mystic_appointments')
  .select('*', { count: 'exact', head: true })
  .eq('workspace_id', MYSTIC_WORKSPACE_ID);
const { count: msgCount } = await admin
  .from('mystic_messages')
  .select('*', { count: 'exact', head: true })
  .eq('workspace_id', MYSTIC_WORKSPACE_ID);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceId: MYSTIC_WORKSPACE_ID,
      password,
      studioAdmin: { email: adminEmail, userId: adminId },
      clients: CLIENTS.map((c) => ({ email: c.email, name: c.fullName, id: clientIds[c.key] })),
      appointments: apptCount,
      messages: msgCount,
      tip: 'Sign in as studio admin for /studio; use any client email for /visits + /messages.',
    },
    null,
    2
  )
);
