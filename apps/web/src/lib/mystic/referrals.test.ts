import { describe, expect, it } from 'vitest';
import { generateReferralCode } from './referrals';

describe('generateReferralCode', () => {
  it('returns a stable MYSTIC-prefixed code', () => {
    const a = generateReferralCode('user-1-workspace');
    const b = generateReferralCode('user-1-workspace');
    expect(a).toMatch(/^MYSTIC[A-Z0-9]{5}$/);
    expect(a).toBe(b);
  });

  it('differs across seeds', () => {
    expect(generateReferralCode('a')).not.toBe(generateReferralCode('b'));
  });
});
