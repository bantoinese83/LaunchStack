export const DEFAULT_REFERRAL_REWARD_AFTER = 5;

export type ReferralRewardType = 'free_blowout' | 'credit_30';

export const DEFAULT_REFERRAL_REWARD: ReferralRewardType = 'free_blowout';

/** How many more pending referrals until the next reward batch. */
export function referralsUntilReward(
  currentCount: number,
  threshold = DEFAULT_REFERRAL_REWARD_AFTER
) {
  if (threshold <= 0) return 0;
  const safe = Math.max(0, Math.floor(currentCount));
  const mod = safe % threshold;
  return mod === 0 && safe > 0 ? 0 : threshold - mod;
}

/** Whole reward batches owed for a pending (uncredited) count. */
export function rewardBatchesDue(pendingCount: number, threshold = DEFAULT_REFERRAL_REWARD_AFTER) {
  if (threshold <= 0) return 0;
  return Math.floor(Math.max(0, pendingCount) / threshold);
}

/** Progress within the current reward cycle (0 … threshold). */
export function referralsTowardNextReward(
  pendingCount: number,
  threshold = DEFAULT_REFERRAL_REWARD_AFTER
) {
  if (threshold <= 0) return 0;
  const safe = Math.max(0, Math.floor(pendingCount));
  const mod = safe % threshold;
  return mod === 0 && safe > 0 ? threshold : mod;
}

export function referralProgressCopy(
  pendingCount: number,
  threshold = DEFAULT_REFERRAL_REWARD_AFTER
) {
  const until = referralsUntilReward(pendingCount, threshold);
  if (until === 0 && pendingCount > 0) {
    return 'Reward ready — blowout credit applies on the next confirmed booking cycle.';
  }
  if (pendingCount <= 0) {
    return `Share your code — free blowout after ${threshold} friends book.`;
  }
  return `${until} more booking${until === 1 ? '' : 's'} until your next free blowout.`;
}
