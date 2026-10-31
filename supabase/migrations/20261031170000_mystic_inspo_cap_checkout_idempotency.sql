-- Inspo: hard cap per appointment (matches DEFAULT_SURCHARGE_RULES.maxInspoPhotos = 4).
-- Checkout: idempotency records for double-submit protection.

CREATE OR REPLACE FUNCTION public.mystic_enforce_appointment_photo_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    cap INT := 4;
    photo_count INT;
BEGIN
    SELECT COUNT(*)::INT
    INTO photo_count
    FROM public.mystic_appointment_photos
    WHERE appointment_id = NEW.appointment_id;

    IF photo_count >= cap THEN
        RAISE EXCEPTION 'Maximum % inspo photos per visit', cap
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mystic_appointment_photos_cap_trg ON public.mystic_appointment_photos;

CREATE TRIGGER mystic_appointment_photos_cap_trg
    BEFORE INSERT ON public.mystic_appointment_photos
    FOR EACH ROW
    EXECUTE FUNCTION public.mystic_enforce_appointment_photo_cap();

CREATE TABLE IF NOT EXISTS public.mystic_checkout_idempotency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    appointment_id UUID REFERENCES public.mystic_appointments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'completed')),
    response_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (client_user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS mystic_checkout_idempotency_created_idx
    ON public.mystic_checkout_idempotency (created_at);

ALTER TABLE public.mystic_checkout_idempotency ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.mystic_checkout_idempotency IS
    'Server-only (service role). Replay-safe booking checkout responses.';
