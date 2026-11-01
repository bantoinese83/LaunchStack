import { describe, expect, it } from 'vitest';
import {
  bookingSubtotalBeforeTip,
  buildTipChoiceFromUi,
  parseCustomTipDollarsToCents,
  parseCustomTipPercent,
  resolveBookingTipCents,
  tipCentsFromPercent,
} from './booking-tips';

describe('tipCentsFromPercent', () => {
  it('rounds to nearest cent', () => {
    expect(tipCentsFromPercent(4500, 18)).toBe(810);
    expect(tipCentsFromPercent(10000, 15)).toBe(1500);
  });
});

describe('parseCustomTipDollarsToCents', () => {
  it('accepts plain and currency input', () => {
    expect(parseCustomTipDollarsToCents('12')).toBe(1200);
    expect(parseCustomTipDollarsToCents('$12.50')).toBe(1250);
  });
});

describe('buildTipChoiceFromUi', () => {
  it('treats cash preset as zero charged tip', () => {
    const choice = buildTipChoiceFromUi({
      preset: 'cash',
      customPercent: '',
      customDollars: '',
    });
    expect(resolveBookingTipCents(4500, choice)).toBe(0);
  });

  it('prefers custom dollars over percent when both set', () => {
    const choice = buildTipChoiceFromUi({
      preset: 'custom',
      customPercent: '20',
      customDollars: '10',
    });
    expect(resolveBookingTipCents(5000, choice)).toBe(1000);
  });

  it('uses custom percent when dollars empty', () => {
    const choice = buildTipChoiceFromUi({
      preset: 'custom',
      customPercent: '22%',
      customDollars: '',
    });
    expect(resolveBookingTipCents(5000, choice)).toBe(1100);
  });
});

describe('bookingSubtotalBeforeTip', () => {
  it('sums base and surcharges only', () => {
    expect(
      bookingSubtotalBeforeTip({
        baseCents: 4500,
        surcharges: [{ code: 'evening', label: 'Evening', amountCents: 2500 }],
      } as Parameters<typeof bookingSubtotalBeforeTip>[0])
    ).toBe(7000);
  });
});
