-- Mystic Hair Co. — indexes for the hot query paths.
--
-- Postgres does not index foreign-key columns automatically, and the mystic_*
-- tables shipped with only a handful of composite indexes. Every query below sits
-- on a user-facing path (booking, checkout, the studio board, the door-timer
-- cron), so each was a sequential scan whose cost grows with appointment history.
--
-- Additive and behaviour-free: indexes change query plans, never results.
-- NOTE: on a table already large enough for the write lock to matter, apply these
-- with CREATE INDEX CONCURRENTLY outside a transaction. Supabase migrations run
-- inside one, so plain CREATE INDEX is used here.

-- "My visits" — packages/api MysticAppointmentService.listForClient
--   WHERE client_user_id = $1 AND starts_at >= $2 ORDER BY starts_at
CREATE INDEX IF NOT EXISTS mystic_appointments_client_starts_idx
    ON public.mystic_appointments (client_user_id, starts_at);

-- Stale-hold sweep — cancelStalePending(), which runs on EVERY availability
-- request and every checkout start:
--   UPDATE ... WHERE workspace_id = $1 AND status = 'pending' AND created_at < $2
CREATE INDEX IF NOT EXISTS mystic_appointments_workspace_status_created_idx
    ON public.mystic_appointments (workspace_id, status, created_at);

-- Door-timer cron (every 5 minutes):
--   WHERE status = 'door_timer_active' AND door_timer_ends_at < now()
-- Partial, so the index only carries live timers.
CREATE INDEX IF NOT EXISTS mystic_appointments_door_timer_idx
    ON public.mystic_appointments (door_timer_ends_at)
    WHERE status = 'door_timer_active';

-- Studio client list — MysticCreditsService.listClientsForStudio, loaded by the
-- today board, calendar, composer, clients panel and both mobile studio screens:
--   WHERE workspace_id = $1 LIMIT 500
CREATE INDEX IF NOT EXISTS mystic_client_profiles_workspace_idx
    ON public.mystic_client_profiles (workspace_id);

-- Inspo photos — read paths filter .eq/.in('appointment_id'), and the
-- mystic_enforce_appointment_photo_cap BEFORE INSERT trigger runs a COUNT(*) on
-- this column for every upload.
CREATE INDEX IF NOT EXISTS mystic_appointment_photos_appointment_idx
    ON public.mystic_appointment_photos (appointment_id);
