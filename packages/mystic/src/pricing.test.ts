import { afterEach, describe, expect, it, vi } from 'vitest';
import { MYSTIC_STUDIO_TIME_ZONE, computeBookingQuote, zonedHour } from './pricing';

function codes(scheduledAt: Date) {
  return computeBookingQuote({
    serviceId: 'blowout',
    scheduledAt,
    distanceMiles: 3, // inside the 5 included miles — isolates the evening surcharge
    entitlement: 'none',
  }).surcharges.map((s) => s.code);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('computeBookingQuote', () => {
  it('waives surcharges for members', () => {
    const quote = computeBookingQuote({
      serviceId: 'blowout',
      scheduledAt: new Date('2026-08-02T02:00:00Z'), // 9pm Chicago (CDT)
      distanceMiles: 12,
      entitlement: 'membership',
    });
    expect(quote.surcharges).toHaveLength(0);
    expect(quote.totalCents).toBe(4500);
  });

  it('applies evening and distance for one-off clients', () => {
    const quote = computeBookingQuote({
      serviceId: 'blowout',
      scheduledAt: new Date('2026-08-02T02:00:00Z'), // 9pm Chicago (CDT)
      distanceMiles: 7,
      entitlement: 'none',
    });
    expect(quote.surcharges.map((s) => s.code)).toEqual(['evening', 'distance']);
    expect(quote.totalCents).toBe(4500 + 2500 + 2 * 500);
  });

  it('does not treat an afternoon Chicago booking as evening on a UTC server', () => {
    // 2026-08-01 15:00 Chicago === 20:00Z. The old getHours() read hour 20 and added
    // the evening surcharge, so the server expected $25 more than the browser quoted
    // and checkout failed with "Quote expired".
    expect(codes(new Date('2026-08-01T20:00:00Z'))).toEqual([]);
  });

  it('applies the evening surcharge for a late Chicago booking', () => {
    // 2026-08-01 21:00 Chicago === 02:00Z the next day — the UTC server used to drop it.
    expect(codes(new Date('2026-08-02T02:00:00Z'))).toEqual(['evening']);
  });

  it('prices identically whatever timezone the runtime is in', () => {
    const instant = new Date('2026-08-01T20:00:00Z'); // 15:00 Chicago

    vi.stubEnv('TZ', 'UTC');
    const utc = codes(instant);
    vi.stubEnv('TZ', 'America/Chicago');
    const chicago = codes(instant);
    vi.stubEnv('TZ', 'Asia/Tokyo');
    const tokyo = codes(instant);

    expect(utc).toEqual(chicago);
    expect(tokyo).toEqual(chicago);
  });
});

describe('zonedHour', () => {
  it('resolves the studio hour across DST and midnight boundaries', () => {
    expect(zonedHour(new Date('2026-08-01T20:00:00Z'))).toBe(15); // CDT (UTC-5)
    expect(zonedHour(new Date('2026-08-02T02:00:00Z'))).toBe(21); // CDT
    expect(zonedHour(new Date('2026-08-01T05:00:00Z'))).toBe(0); // Chicago midnight, not 24
    expect(zonedHour(new Date('2026-01-15T15:00:00Z'))).toBe(9); // CST (UTC-6)
    expect(zonedHour(new Date('2026-08-01T20:00:00Z'), MYSTIC_STUDIO_TIME_ZONE)).toBe(15);
  });

  it('honours an explicit timezone', () => {
    expect(zonedHour(new Date('2026-08-01T20:00:00Z'), 'UTC')).toBe(20);
    expect(zonedHour(new Date('2026-08-01T20:00:00Z'), 'Asia/Tokyo')).toBe(5); // next day
  });

  it('falls back to the runtime hour for an unknown timezone instead of throwing', () => {
    const at = new Date('2026-08-01T20:00:00Z');
    vi.stubEnv('TZ', 'UTC');
    expect(zonedHour(at, 'Not/AZone')).toBe(20);
  });
});
