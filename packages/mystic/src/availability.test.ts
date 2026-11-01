import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildTimeSlotsForDate, zonedDayRangeIso, zonedTimeToUtc } from './availability';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildTimeSlotsForDate', () => {
  it('offers the studio local day for a 90-min visit with a 30-min buffer', () => {
    const slots = buildTimeSlotsForDate('2026-08-01', 90, 30, []);

    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('18:00');
    expect(slots).toHaveLength(19);
  });

  it('excludes slots overlapping an existing visit when the server runs UTC', () => {
    vi.stubEnv('TZ', 'UTC'); // what Vercel uses
    // 2026-08-01 10:00 Chicago (CDT) === 15:00Z
    const slots = buildTimeSlotsForDate('2026-08-01', 90, 30, [new Date('2026-08-01T15:00:00Z')]);

    expect(slots).not.toContain('09:00');
    expect(slots).not.toContain('10:30');
    expect(slots).toContain('11:00');
  });

  it('produces identical slots in every runtime timezone', () => {
    const booked = [new Date('2026-08-01T15:00:00Z')];

    vi.stubEnv('TZ', 'UTC');
    const utc = buildTimeSlotsForDate('2026-08-01', 90, 30, booked);
    vi.stubEnv('TZ', 'America/Chicago');
    const chicago = buildTimeSlotsForDate('2026-08-01', 90, 30, booked);
    vi.stubEnv('TZ', 'Asia/Tokyo');
    const tokyo = buildTimeSlotsForDate('2026-08-01', 90, 30, booked);

    expect(chicago).toEqual(utc);
    expect(tokyo).toEqual(utc);
  });

  it('uses the real visit length instead of assuming one hour', () => {
    // A 3-hour visit from 13:00 Chicago blocks starts 12:30–15:30.
    const slots = buildTimeSlotsForDate('2026-08-01', 60, 0, [
      { start: zonedTimeToUtc('2026-08-01', 13, 0), durationMinutes: 180 },
    ]);

    expect(slots).toContain('11:00');
    expect(slots).toContain('12:00'); // ends exactly as the visit begins
    expect(slots).not.toContain('12:30');
    expect(slots).not.toContain('15:30');
    expect(slots).toContain('16:00');
  });

  it('returns no slots for a malformed date', () => {
    expect(buildTimeSlotsForDate('not-a-date', 60, 30, [])).toEqual([]);
  });
});

describe('zonedTimeToUtc', () => {
  it('maps studio wall clock to the right instant across DST', () => {
    expect(zonedTimeToUtc('2026-08-01', 9, 0).toISOString()).toBe('2026-08-01T14:00:00.000Z'); // CDT
    expect(zonedTimeToUtc('2026-01-15', 9, 0).toISOString()).toBe('2026-01-15T15:00:00.000Z'); // CST
  });

  it('honours an explicit timezone', () => {
    expect(zonedTimeToUtc('2026-08-01', 9, 0, 'UTC').toISOString()).toBe(
      '2026-08-01T09:00:00.000Z'
    );
  });
});

describe('zonedDayRangeIso', () => {
  it('covers the whole studio day including the evening', () => {
    const { from, to } = zonedDayRangeIso('2026-08-01');

    expect(from).toBe('2026-08-01T05:00:00.000Z'); // 00:00 CDT
    expect(to).toBe('2026-08-02T04:59:59.999Z'); // 23:59:59.999 CDT

    // A 19:00 Chicago visit is 00:00Z the next day and must fall inside the window.
    const evening = new Date('2026-08-02T00:00:00Z').getTime();
    expect(evening).toBeGreaterThan(new Date(from).getTime());
    expect(evening).toBeLessThan(new Date(to).getTime());
  });
});
