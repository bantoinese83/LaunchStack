-- Studio ops suite: availability, CMS menu overrides, promos, manual credits, client Stripe ids

ALTER TABLE public.mystic_studio_settings
    ADD COLUMN IF NOT EXISTS booking_start_hour INT NOT NULL DEFAULT 9
        CHECK (booking_start_hour >= 0 AND booking_start_hour <= 23),
    ADD COLUMN IF NOT EXISTS booking_end_hour INT NOT NULL DEFAULT 20
        CHECK (booking_end_hour >= 1 AND booking_end_hour <= 24),
    ADD COLUMN IF NOT EXISTS slot_minutes INT NOT NULL DEFAULT 30
        CHECK (slot_minutes >= 15 AND slot_minutes <= 60),
    ADD COLUMN IF NOT EXISTS weekly_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS menu_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.mystic_client_profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS mystic_client_profiles_stripe_customer_idx
    ON public.mystic_client_profiles (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.mystic_blocked_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS mystic_blocked_intervals_workspace_range_idx
    ON public.mystic_blocked_intervals (workspace_id, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS public.mystic_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    percent_off INT CHECK (percent_off IS NULL OR (percent_off >= 1 AND percent_off <= 100)),
    amount_off_cents INT CHECK (amount_off_cents IS NULL OR amount_off_cents >= 1),
    active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (workspace_id, code),
    CHECK (percent_off IS NOT NULL OR amount_off_cents IS NOT NULL)
);

ALTER TABLE public.mystic_appointments
    ADD COLUMN IF NOT EXISTS promo_code TEXT,
    ADD COLUMN IF NOT EXISTS discount_cents INT NOT NULL DEFAULT 0;

ALTER TABLE public.mystic_client_credits
    DROP CONSTRAINT IF EXISTS mystic_client_credits_source_kind_check;

ALTER TABLE public.mystic_client_credits
    ADD CONSTRAINT mystic_client_credits_source_kind_check
        CHECK (source_kind IN ('membership', 'package', 'manual'));

ALTER TABLE public.mystic_blocked_intervals ENABLE ROW LEVEL SECURITY;

CREATE POLICY mystic_blocked_intervals_studio ON public.mystic_blocked_intervals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_blocked_intervals.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'admin')
        )
    );

ALTER TABLE public.mystic_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY mystic_promotions_studio ON public.mystic_promotions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = mystic_promotions.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'admin')
        )
    );
