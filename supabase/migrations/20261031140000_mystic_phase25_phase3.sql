-- Mystic Hair Co. — Phase 2.5 (deposits, blocks, credits, inspo) + Phase 3 (shop preorders)

ALTER TABLE public.mystic_appointments
    ADD COLUMN IF NOT EXISTS payment_captured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.mystic_client_profiles
    ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS mystic_client_profiles_referral_code_idx
    ON public.mystic_client_profiles (referral_code)
    WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.mystic_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    block_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (workspace_id, block_date)
);

CREATE TABLE IF NOT EXISTS public.mystic_client_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_kind TEXT NOT NULL CHECK (source_kind IN ('membership', 'package')),
    source_id TEXT NOT NULL,
    blowouts_remaining INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS mystic_client_credits_user_idx
    ON public.mystic_client_credits (workspace_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS mystic_client_credits_membership_unique
    ON public.mystic_client_credits (workspace_id, user_id, source_kind, source_id)
    WHERE source_kind = 'membership';

CREATE TABLE IF NOT EXISTS public.mystic_appointment_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.mystic_appointments(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mystic_preorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    amount_cents INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'canceled')),
    stripe_checkout_session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mystic_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_client_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_appointment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystic_preorders ENABLE ROW LEVEL SECURITY;

CREATE POLICY mystic_blocked_dates_studio ON public.mystic_blocked_dates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_blocked_dates.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_client_credits_self ON public.mystic_client_credits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY mystic_client_credits_studio ON public.mystic_client_credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_client_credits.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('workspace_owner', 'workspace_admin')
        )
    );

CREATE POLICY mystic_appointment_photos_client ON public.mystic_appointment_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.mystic_appointments a
            WHERE a.id = mystic_appointment_photos.appointment_id
              AND a.client_user_id = auth.uid()
        )
    );

CREATE POLICY mystic_appointment_photos_insert ON public.mystic_appointment_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mystic_appointments a
            WHERE a.id = mystic_appointment_photos.appointment_id
              AND a.client_user_id = auth.uid()
        )
    );

CREATE POLICY mystic_preorders_self ON public.mystic_preorders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY mystic_preorders_insert ON public.mystic_preorders
    FOR INSERT WITH CHECK (user_id = auth.uid());
