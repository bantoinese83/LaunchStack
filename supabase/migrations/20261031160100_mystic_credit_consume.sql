ALTER TABLE public.mystic_appointments
    ADD COLUMN IF NOT EXISTS consumed_credit_id UUID REFERENCES public.mystic_client_credits(id) ON DELETE SET NULL;
