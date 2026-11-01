import { describe, expect, it } from 'vitest';
import {
  buildReferralInviteUrl,
  buildReferralShortPath,
  normalizeReferralCode,
  referralCodeForCheckout,
} from './referral-links';

describe('normalizeReferralCode', () => {
  it('uppercases and strips invalid chars', () => {
    expect(normalizeReferralCode(' abcd-12 ')).toBe('ABCD12');
  });

  it('rejects too short codes', () => {
    expect(normalizeReferralCode('abc')).toBeNull();
  });
});

describe('referralCodeForCheckout', () => {
  it('prefers code over name', () => {
    expect(referralCodeForCheckout('MYSTIC1', 'Jane')).toEqual({ referralCode: 'MYSTIC1' });
  });

  it('falls back to name', () => {
    expect(referralCodeForCheckout(null, 'Jane Doe')).toEqual({ referredByName: 'Jane Doe' });
  });
});

describe('buildReferralInviteUrl', () => {
  it('builds short invite path on origin', () => {
    expect(buildReferralInviteUrl('https://mystichair.com', 'MYSTIC1')).toBe(
      'https://mystichair.com/r/MYSTIC1'
    );
    expect(buildReferralShortPath('MYSTIC1')).toBe('/r/MYSTIC1');
  });
});
