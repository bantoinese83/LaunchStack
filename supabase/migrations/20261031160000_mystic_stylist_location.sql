-- Live map: Luke shares GPS while en route (client sees link on My visits)
ALTER TABLE public.mystic_appointments
    ADD COLUMN IF NOT EXISTS stylist_latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS stylist_longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS stylist_location_updated_at TIMESTAMPTZ;
