-- SEED DATA FOR LOCAL DEVELOPMENT

-- Super Admin User
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@launchstack.com', '{"full_name": "Super Admin"}')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET system_role = 'super_admin' WHERE id = '00000000-0000-0000-0000-000000000001';

-- Demo Customer User
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000002', 'demo@launchstack.com', '{"full_name": "Alex Founder"}')
ON CONFLICT (id) DO NOTHING;

-- Demo Workspace
INSERT INTO public.workspaces (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'acme-corp')
ON CONFLICT (id) DO NOTHING;

-- Workspace Membership
INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'workspace_owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Active Subscription
INSERT INTO public.subscriptions (workspace_id, stripe_subscription_id, stripe_price_id, status, current_period_end)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sub_mock_12345',
    'price_pro_monthly',
    'active',
    timezone('utc'::text, now() + interval '30 days')
)
ON CONFLICT (workspace_id) DO NOTHING;

-- Sample Feedback Items
INSERT INTO public.feedback_posts (id, workspace_id, author_id, title, description, category, status, upvotes_count)
VALUES
(
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    'Add Dark Mode Support to Mobile App',
    'It would be great to have dark mode enabled by default on the Expo iOS and Android app.',
    'feature',
    'planned',
    12
),
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    'Export Feedback Items to CSV',
    'We need the ability to export all submitted roadmap items to CSV for quarterly product review.',
    'improvement',
    'under_review',
    5
)
ON CONFLICT (id) DO NOTHING;
