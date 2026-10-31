-- Mystic Hair Co. — appointments, messaging, blasts, referrals, studio settings
-- Apply when ready (Phase 2 operations)

CREATE TABLE IF NOT EXISTS public.mystic_client_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    phone TEXT,
    birthday DATE,
    marketing_sms BOOLEAN NOT NULL DEFAULT true,
    marketing_email BOOLEAN NOT NULL DEFAULT true,
    referral_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mystic_studio_settings (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    winter_buffer_enabled BOOLEAN NOT NULL DEFAULT false,
    evening_surcharge_cents INT NOT NULL DEFAULT 2500,
    included_miles NUMERIC(6,2) NOT NULL DEFAULT 5,
    per_mile_surcharge_cents INT NOT NULL DEFAULT 500,
    deposit_cents INT NOT NULL DEFAULT 2500,
    door_timer_minutes INT NOT NULL DEFAULT 15,
    referral_reward_after INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TYPE public.mystic_appointment_status AS ENUM (
    'pending',
    'confirmed',
    'stylist_en_route',
    'stylist_arrived',
    'door_timer_active',
    'in_progress',
    'completed',
    'canceled',
    'no_show'
);

CREATE TABLE IF NOT EXISTS public.mystic_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    address JSONB NOT NULL,
    distance_miles NUMERIC(8,2),
    entitlement TEXT NOT NULL DEFAULT 'none' CHECK (entitlement IN ('none', 'membership', 'package')),
    quote_cents INT NOT NULL,
    surcharge_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    tip_cents INT NOT NULL DEFAULT 0,
    tags TEXT[] NOT NULL DEFAULT '{}',
    referred_by_name TEXT,
    status public.mystic_appointment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    deposit_cents INT NOT NULL DEFAULT 0,
    deposit_captured BOOLEAN NOT NULL DEFAULT false,
    door_timer_ends_at TIMESTAMPTZ,
    eta_minutes INT,
    client_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mystic_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.mystic_appointments(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'stylist')),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    attachment_urls TEXT[] NOT NULL DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mystic_blasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
    segment TEXT NOT NULL CHECK (segment IN ('all', 'members', 'packages', 'upcoming_week')),
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    recipient_count INT NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mystic_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referred_name TEXT NOT NULL,
    appointment_id UUID REFERENCES public.mystic_appointments(id) ON DELETE SET NULL,
    credited BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS mystic_appointments_workspace_starts_idx
    ON public.mystic_appointments (workspace_id, starts_at);
CREATE INDEX IF NOT EXISTS mystic_messages_thread_idx
    ON public.mystic_messages (workspace_id, client_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mystic_referrals_referrer_idx
    ON public.mystic_referrals (workspace_id, referrer_user_id);

ALTER TABLE public.mystic_client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_studio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_blasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_referrals ENABLE ROW LEVEL SECURITY;

-- Clients read/update own profile
CREATE POLICY mystic_client_profiles_self ON public.mystic_client_profiles
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Studio owners/admins manage workspace data
CREATE POLICY mystic_studio_settings_owner ON public.mystic_studio_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_studio_settings.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_appointments_client_read ON public.mystic_appointments
    FOR SELECT USING (client_user_id = auth.uid());

CREATE POLICY mystic_appointments_client_insert ON public.mystic_appointments
    FOR INSERT WITH CHECK (client_user_id = auth.uid());

CREATE POLICY mystic_appointments_studio ON public.mystic_appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_appointments.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_messages_participants ON public.mystic_messages
    FOR ALL USING (
        client_user_id = auth.uid()
        OR sender_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_messages.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_blasts_studio ON public.mystic_blasts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_blasts.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_referrals_read ON public.mystic_referrals
    FOR SELECT USING (
        referrer_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_referrals.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_referrals_insert ON public.mystic_referrals
    FOR INSERT WITH CHECK (true);
