-- SEED DATA FOR LOCAL DEVELOPMENT
-- Password for both users: LaunchStack!demo

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@launchstack.com',
    crypt('LaunchStack!demo', gen_salt('bf')),
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'demo@launchstack.com',
    crypt('LaunchStack!demo', gen_salt('bf')),
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Founder"}',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE
SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@launchstack.com"}',
    'email',
    '00000000-0000-0000-0000-000000000001',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"demo@launchstack.com"}',
    'email',
    '00000000-0000-0000-0000-000000000002',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET system_role = 'super_admin' WHERE id = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.workspaces (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'acme-corp')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'workspace_owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

INSERT INTO public.subscriptions (workspace_id, stripe_subscription_id, stripe_price_id, status, current_period_end)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sub_mock_12345',
    'price_pro_monthly',
    'active',
    timezone('utc'::text, now() + interval '30 days')
)
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO public.feedback_posts (id, workspace_id, author_id, title, description, category, status, upvotes_count, flagged)
VALUES
(
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    'Add Dark Mode Support to Mobile App',
    'It would be great to have dark mode enabled by default on the Expo iOS and Android app.',
    'feature',
    'planned',
    12,
    false
),
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    'Export Feedback Items to CSV',
    'We need the ability to export all submitted roadmap items to CSV for quarterly product review.',
    'improvement',
    'under_review',
    5,
    true
)
ON CONFLICT (id) DO NOTHING;
