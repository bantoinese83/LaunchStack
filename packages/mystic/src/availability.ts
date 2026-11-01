import { MYSTIC_STUDIO_TIME_ZONE } from './pricing';

/** Default house-call hours (local Chicago — studio can override later). */
export const DEFAULT_STUDIO_HOURS = {
  startHour: 9,
  endHour: 20,
  slotMinutes: 30,
} as const;

/** Assumed length of an existing booking when the row has no duration. */
export const DEFAULT_BOOKED_DURATION_MINUTES = 60;

export type BookedSlot = { start: Date; durationMinutes?: number };

/** UTC offset (minutes) of `timeZone` at `at` — DST aware. */
function zoneOffsetMinutes(at: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(at);
    const get = (type: string) =>
      Number.parseInt(parts.find((p) => p.type === type)?.value ?? '', 10);
    const asIfUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second')
    );
    return Math.round((asIfUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
  } catch {
    /* unknown timezone — fall back to the runtime offset */
    return -at.getTimezoneOffset();
  }
}

/**
 * The instant matching a wall-clock time on `dateIso` in `timeZone`.
 *
 * Slots used to be built with `Date#setHours`, which reads the *runtime* timezone
 * — on a UTC server the "09:00" slot was 09:00 UTC (04:00 Chicago) while the
 * client booked it as 09:00 Chicago, so bookings landed in the wrong hour and
 * overlapping visits were not filtered out.
 */
export function zonedTimeToUtc(
  dateIso: string,
  hour: number,
  minute = 0,
  timeZone: string = MYSTIC_STUDIO_TIME_ZONE
): Date {
  const [y, m, d] = dateIso.split('-').map((v) => Number.parseInt(v, 10));
  const naive = Date.UTC(y, m - 1, d, hour, minute, 0, 0);
  if (!Number.isFinite(naive)) return new Date(Number.NaN);
  // Apply the offset twice so a DST transition resolves to the right instant.
  const firstPass = naive - zoneOffsetMinutes(new Date(naive), timeZone) * 60_000;
  const secondPass = naive - zoneOffsetMinutes(new Date(firstPass), timeZone) * 60_000;
  return new Date(secondPass);
}

function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split('-').map((v) => Number.parseInt(v, 10));
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return Number.isNaN(next.getTime()) ? dateIso : next.toISOString().slice(0, 10);
}

/**
 * UTC window covering the whole local calendar day in `timeZone`.
 *
 * The availability query used a UTC day (`T00:00:00.000Z`–`T23:59:59.999Z`), so a
 * 19:00 Chicago visit (00:00Z the next day) was never loaded and its slot was
 * offered to someone else.
 */
export function zonedDayRangeIso(dateIso: string, timeZone: string = MYSTIC_STUDIO_TIME_ZONE) {
  const from = zonedTimeToUtc(dateIso, 0, 0, timeZone);
  const nextDayStart = zonedTimeToUtc(addDaysIso(dateIso, 1), 0, 0, timeZone);
  const to = new Date(nextDayStart.getTime() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatHhMm(minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Parse a studio wall-clock slot (`HH:mm`) from availability API. */
export function parseBookingSlotHhMm(slotHhMm: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(slotHhMm.trim());
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** 12-hour label for booking chips (studio local time). */
export function formatBookingSlotLabel(slotHhMm: string): string {
  const parsed = parseBookingSlotHhMm(slotHhMm);
  if (!parsed) return slotHhMm;
  const { hour, minute } = parsed;
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  if (minute === 0) return `${h12} ${period}`;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Instant for checkout/pricing — always Chicago wall clock, not the device timezone. */
export function scheduledAtFromBookingSlot(
  dateIso: string,
  slotHhMm: string,
  timeZone: string = MYSTIC_STUDIO_TIME_ZONE
): Date {
  const parsed = parseBookingSlotHhMm(slotHhMm);
  if (!parsed) return new Date(Number.NaN);
  return zonedTimeToUtc(dateIso, parsed.hour, parsed.minute, timeZone);
}

/** Client-facing hour label (e.g. surcharge copy). */
export function formatStudioHourLabel(hour24: number): string {
  const h = ((hour24 % 24) + 24) % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${period}`;
}

export function buildTimeSlotsForDate(
  dateIso: string,
  durationMinutes: number,
  bufferMinutes: number,
  booked: readonly (Date | BookedSlot)[],
  options: {
    timeZone?: string;
    hours?: { startHour: number; endHour: number; slotMinutes: number };
  } = {}
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return [];
  const timeZone = options.timeZone ?? MYSTIC_STUDIO_TIME_ZONE;
  const hours = options.hours ?? DEFAULT_STUDIO_HOURS;

  const bookedIntervals = booked.map((entry) => {
    const start = entry instanceof Date ? entry : entry.start;
    const minutes =
      entry instanceof Date
        ? DEFAULT_BOOKED_DURATION_MINUTES
        : (entry.durationMinutes ?? DEFAULT_BOOKED_DURATION_MINUTES);
    return { startMs: start.getTime(), endMs: start.getTime() + minutes * 60_000 };
  });

  const slots: string[] = [];
  const startMinutes = hours.startHour * 60;
  const endMinutes = hours.endHour * 60;

  // Walk the studio wall clock, so the label and the instant always agree.
  for (
    let minutes = startMinutes;
    minutes + durationMinutes + bufferMinutes <= endMinutes;
    minutes += hours.slotMinutes
  ) {
    const slotStart = zonedTimeToUtc(dateIso, Math.floor(minutes / 60), minutes % 60, timeZone);
    if (Number.isNaN(slotStart.getTime())) continue;
    const slotStartMs = slotStart.getTime();
    const slotEndMs = slotStartMs + durationMinutes * 60_000;
    const overlaps = bookedIntervals.some(
      (interval) => slotStartMs < interval.endMs && slotEndMs > interval.startMs
    );
    if (!overlaps) slots.push(formatHhMm(minutes));
  }

  return slots;
}
