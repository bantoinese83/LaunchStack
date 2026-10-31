import { describe, expect, it } from 'vitest';
import { computeBookingQuote } from './pricing';

describe('computeBookingQuote', () => {
  it('waives surcharges for members', () => {
    const quote = computeBookingQuote({
      serviceId: 'blowout',
      scheduledAt: new Date('2026-08-01T21:00:00'),
      distanceMiles: 12,
      entitlement: 'membership',
    });
    expect(quote.surcharges).toHaveLength(0);
    expect(quote.totalCents).toBe(4500);
  });

  it('applies evening and distance for one-off clients', () => {
    const quote = computeBookingQuote({
      serviceId: 'blowout',
      scheduledAt: new Date('2026-08-01T21:00:00'),
      distanceMiles: 7,
      entitlement: 'none',
    });
    expect(quote.surcharges.map((s) => s.code)).toEqual(['evening', 'distance']);
    expect(quote.totalCents).toBe(4500 + 2500 + 2 * 500);
  });
});
