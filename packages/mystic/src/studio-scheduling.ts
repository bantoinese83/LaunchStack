import { MYSTIC_STUDIO_TIME_ZONE } from './pricing';
import { zonedTimeToUtc } from './availability';
import type { BookedSlot } from './availability';

/** 0 = Sunday … 6 = Saturday (Chicago wall clock). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeeklyHoursDay = {
  enabled: boolean;
  startHour: number;
  endHour: number;
};

export type WeeklyHoursMap = Partial<Record<WeekdayIndex, WeeklyHoursDay>>;

export type StudioBookingHoursConfig = {
  bookingStartHour: number;
  bookingEndHour: number;
  slotMinutes: number;
  weeklyHours: WeeklyHoursMap;
  timeZone?: string;
};

export type BlockedInterval = {
  startsAt: string;
  endsAt: string;
};

function weekdayIndexForDateIso(dateIso: string, timeZone: string): WeekdayIndex {
  const noon = zonedTimeToUtc(dateIso, 12, 0, timeZone);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).formatToParts(noon);
  const wd = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const map: Record<string, WeekdayIndex> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

/** Resolved hours for a calendar day; null when the studio is closed that day. */
export function resolveStudioHoursForDate(
  dateIso: string,
  config: StudioBookingHoursConfig
): { startHour: number; endHour: number; slotMinutes: number } | null {
  const timeZone = config.timeZone ?? MYSTIC_STUDIO_TIME_ZONE;
  const dow = weekdayIndexForDateIso(dateIso, timeZone);
  const override = config.weeklyHours[dow];
  if (override) {
    if (!override.enabled) return null;
    return {
      startHour: override.startHour,
      endHour: override.endHour,
      slotMinutes: config.slotMinutes,
    };
  }
  return {
    startHour: config.bookingStartHour,
    endHour: config.bookingEndHour,
    slotMinutes: config.slotMinutes,
  };
}

export function slotInstantMs(
  dateIso: string,
  slotHhMm: string,
  timeZone: string = MYSTIC_STUDIO_TIME_ZONE
): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(slotHhMm.trim());
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const d = zonedTimeToUtc(dateIso, hour, minute, timeZone);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/** Drop slots overlapping a blocked interval or an existing booking window. */
export function filterSlotsByBlockedIntervals(
  dateIso: string,
  slotLabels: string[],
  durationMinutes: number,
  blocked: readonly BlockedInterval[],
  timeZone: string = MYSTIC_STUDIO_TIME_ZONE
): string[] {
  if (!blocked.length) return slotLabels;
  const blockedMs = blocked
    .map((b) => ({
      start: new Date(b.startsAt).getTime(),
      end: new Date(b.endsAt).getTime(),
    }))
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end));

  return slotLabels.filter((label) => {
    const startMs = slotInstantMs(dateIso, label, timeZone);
    if (startMs == null) return false;
    const endMs = startMs + durationMinutes * 60_000;
    return !blockedMs.some((b) => startMs < b.end && endMs > b.start);
  });
}

export function bookedSlotsOverlapInterval(
  booked: readonly (Date | BookedSlot)[],
  interval: BlockedInterval
): boolean {
  const bStart = new Date(interval.startsAt).getTime();
  const bEnd = new Date(interval.endsAt).getTime();
  return booked.some((entry) => {
    const start = entry instanceof Date ? entry : entry.start;
    const minutes = entry instanceof Date ? 60 : (entry.durationMinutes ?? 60);
    const startMs = start.getTime();
    const endMs = startMs + minutes * 60_000;
    return startMs < bEnd && endMs > bStart;
  });
}
