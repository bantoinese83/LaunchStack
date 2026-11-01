import { describe, expect, it } from 'vitest';
import {
  availableBookingEntitlements,
  inferClientEntitlementFromCredits,
  shouldShowBookingPlansNudge,
} from './booking-entitlement';

describe('shouldShowBookingPlansNudge', () => {
  it('shows for blowouts without credits', () => {
    expect(shouldShowBookingPlansNudge('blowout', 'none')).toBe(true);
    expect(shouldShowBookingPlansNudge('blowout', 'membership')).toBe(false);
    expect(shouldShowBookingPlansNudge('haircut', 'none')).toBe(false);
  });
});

describe('inferClientEntitlementFromCredits', () => {
  it('prefers membership over package', () => {
    const credits = [
      { source_kind: 'package', blowouts_remaining: 2, expires_at: null },
      { source_kind: 'membership', blowouts_remaining: 1, expires_at: null },
    ];
    expect(inferClientEntitlementFromCredits(credits, 'blowout')).toBe('membership');
  });
});

describe('availableBookingEntitlements', () => {
  it('offers membership and package when credits exist', () => {
    const credits = [
      { source_kind: 'membership', blowouts_remaining: 1, expires_at: null },
      { source_kind: 'package', blowouts_remaining: 2, expires_at: null },
    ];
    expect(availableBookingEntitlements(credits, 'blowout')).toEqual([
      'none',
      'membership',
      'package',
    ]);
  });

  it('returns pay-as-you-go only for non-blowout services', () => {
    expect(availableBookingEntitlements([], 'haircut')).toEqual(['none']);
  });
});
