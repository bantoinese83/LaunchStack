import type { AppointmentTagId } from './catalog';

export const MAX_APPOINTMENT_TAGS = 4;

export function toggleAppointmentTag(
  current: AppointmentTagId[],
  id: AppointmentTagId
): AppointmentTagId[] {
  if (current.includes(id)) return current.filter((t) => t !== id);
  if (current.length >= MAX_APPOINTMENT_TAGS) return current;
  return [...current, id];
}

/** Clamp stylist ETA input to server-accepted range. */
/** Client checkout double-tap protection (8–128 chars for API). */
export function createCheckoutIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mystic-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

export function clampEnRouteEtaMinutes(raw: number | string): number {
  const n = typeof raw === 'string' ? Number.parseInt(raw, 10) : raw;
  if (!Number.isFinite(n)) return 20;
  return Math.min(180, Math.max(1, Math.round(n)));
}
