import { describe, expect, it } from 'vitest';
import {
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
