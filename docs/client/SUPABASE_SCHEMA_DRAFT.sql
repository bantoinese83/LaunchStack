-- Mystic Hair Co. — draft tables (apply when ready; not pushed by agent)
-- Extends LaunchStack workspace model: single workspace = Mystic Hair studio

-- create type mystic_service as enum ('blowout','haircut','updo','dry_style');
-- create type mystic_entitlement as enum ('none','membership','package');

-- mystic_appointments (
--   id uuid primary key,
--   workspace_id uuid references workspaces(id),
--   client_user_id uuid references auth.users(id),
--   service_id text not null,
--   starts_at timestamptz not null,
--   duration_minutes int not null,
--   address jsonb not null,
--   distance_miles numeric,
--   quote_cents int not null,
--   surcharge_json jsonb,
--   status text default 'pending',
--   tags text[],
--   referred_by_name text,
--   stripe_payment_intent_id text,
--   created_at timestamptz default now()
-- );

-- mystic_client_credits (membership blowouts remaining, package blowouts + expires_at)
-- mystic_studio_settings (winter_buffer, evening_surcharge_cents, per_mile_cents, blocked_dates)
