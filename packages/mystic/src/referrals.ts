export const DEFAULT_REFERRAL_REWARD_AFTER = 5;

export type ReferralRewardType = 'free_blowout' | 'credit_30';

export const DEFAULT_REFERRAL_REWARD: ReferralRewardType = 'free_blowout';

export function referralsUntilReward(
  currentCount: number,
  threshold = DEFAULT_REFERRAL_REWARD_AFTER
) {
  const mod = currentCount % threshold;
  return mod === 0 && currentCount > 0 ? 0 : threshold - mod;
}
