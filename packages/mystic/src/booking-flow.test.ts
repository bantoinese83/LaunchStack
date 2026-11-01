import { describe, expect, it } from 'vitest';
import { defaultBookingDateIso } from './booking-flow';

describe('defaultBookingDateIso', () => {
  it('skips weekends', () => {
    const saturday = new Date('2026-11-07T12:00:00');
    expect(defaultBookingDateIso(saturday)).toBe('2026-11-09');
  });

  it('returns same day when weekday', () => {
    const monday = new Date('2026-11-02T12:00:00');
    expect(defaultBookingDateIso(monday)).toBe('2026-11-02');
  });
});
