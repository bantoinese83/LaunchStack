import { describe, expect, it } from 'vitest';
import {
  DEFAULT_REFERRAL_REWARD_AFTER,
  referralProgressCopy,
  referralsTowardNextReward,
  referralsUntilReward,
  rewardBatchesDue,
} from './referrals';

describe('referralsUntilReward', () => {
  it('uses the default threshold of 5', () => {
    expect(DEFAULT_REFERRAL_REWARD_AFTER).toBe(5);
    expect(referralsUntilReward(0)).toBe(5);
    expect(referralsUntilReward(3)).toBe(2);
    expect(referralsUntilReward(5)).toBe(0);
    expect(referralsUntilReward(6)).toBe(4);
  });

  it('respects a custom threshold', () => {
    expect(referralsUntilReward(0, 3)).toBe(3);
    expect(referralsUntilReward(2, 3)).toBe(1);
    expect(referralsUntilReward(3, 3)).toBe(0);
  });
});

describe('rewardBatchesDue', () => {
  it('counts whole batches only', () => {
    expect(rewardBatchesDue(0)).toBe(0);
    expect(rewardBatchesDue(4)).toBe(0);
    expect(rewardBatchesDue(5)).toBe(1);
    expect(rewardBatchesDue(11)).toBe(2);
    expect(rewardBatchesDue(9, 3)).toBe(3);
  });
});

describe('referralsTowardNextReward', () => {
  it('tracks progress inside the current cycle', () => {
    expect(referralsTowardNextReward(0)).toBe(0);
    expect(referralsTowardNextReward(3)).toBe(3);
    expect(referralsTowardNextReward(5)).toBe(5);
    expect(referralsTowardNextReward(7)).toBe(2);
  });
});

describe('referralProgressCopy', () => {
  it('explains empty, mid-progress, and reward-ready states', () => {
    expect(referralProgressCopy(0, 5)).toContain('after 5 friends');
    expect(referralProgressCopy(3, 5)).toBe('2 more bookings until your next free blowout.');
    expect(referralProgressCopy(4, 5)).toBe('1 more booking until your next free blowout.');
    expect(referralProgressCopy(5, 5)).toContain('Reward ready');
  });
});
