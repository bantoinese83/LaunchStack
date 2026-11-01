import { describe, expect, it } from 'vitest';
import { computePromoDiscountCents, normalizePromoCode } from './promotions';

describe('promotions', () => {
  it('normalizes codes', () => {
    expect(normalizePromoCode('  holiday 20 ')).toBe('HOLIDAY20');
  });

  it('computes percent and amount discounts', () => {
    expect(computePromoDiscountCents(10000, { percent_off: 20, amount_off_cents: null })).toBe(
      2000
    );
    expect(computePromoDiscountCents(10000, { percent_off: null, amount_off_cents: 1500 })).toBe(
      1500
    );
    expect(computePromoDiscountCents(500, { percent_off: null, amount_off_cents: 1500 })).toBe(500);
  });
});
