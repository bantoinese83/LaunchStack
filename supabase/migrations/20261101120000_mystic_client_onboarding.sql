-- First-run client onboarding (web + mobile share this flag)
ALTER TABLE public.mystic_client_profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.mystic_client_profiles.onboarding_completed_at IS
    'Set when the client finishes or skips the lightweight welcome flow';
