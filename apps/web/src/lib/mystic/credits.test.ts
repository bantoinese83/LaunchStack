import { afterEach, describe, expect, it, vi } from 'vitest';
import { creditGrantForMembership, creditGrantForPackage } from './credits';

describe('credit grant expiry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('clamps a month-end membership grant to the last day of the next month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 12, 0, 0)); // local Jan 31

    const grant = creditGrantForMembership('glow');
    const expiry = new Date(grant!.expiresAt);

    // setMonth(+1) alone rolls Jan 31 into Mar 3, quietly granting extra days.
    expect(expiry.getMonth()).toBe(1); // February
    expect(expiry.getDate()).toBe(28);
  });

  it('clamps a 6-month package grant to the target month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 31, 12, 0, 0)); // local Aug 31

    const grant = creditGrantForPackage('pack_4');
    const expiry = new Date(grant!.expiresAt);

    expect(expiry.getFullYear()).toBe(2027);
    expect(expiry.getMonth()).toBe(1); // February
    expect(expiry.getDate()).toBe(28);
  });

  it('still grants the plan allowance', () => {
    const grant = creditGrantForMembership('luxe');
    expect(grant).toMatchObject({
      sourceKind: 'membership',
      sourceId: 'luxe',
      blowoutsRemaining: 4,
    });
  });
});

describe('package grant source id', () => {
  it('keys the grant on the purchase so replays dedupe', () => {
    expect(creditGrantForPackage('pack_4', 'cs_test_123')).toMatchObject({
      sourceId: 'cs_test_123',
      blowoutsRemaining: 4,
    });
  });

  it('falls back to the pack id for legacy callers', () => {
    expect(creditGrantForPackage('pack_10')?.sourceId).toBe('pack_10');
  });

  it('returns null for an unknown pack', () => {
    expect(creditGrantForPackage('nope' as never)).toBeNull();
  });
});
