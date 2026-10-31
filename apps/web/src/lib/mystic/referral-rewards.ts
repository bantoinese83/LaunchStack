import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService } from '@template/api';
import { DEFAULT_REFERRAL_REWARD_AFTER } from '@template/mystic';

export async function applyReferralRewardsIfDue(admin: SupabaseClient, workspaceId: string) {
  const { data: settings } = await admin
    .from('mystic_studio_settings')
    .select('referral_reward_after')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  const threshold = settings?.referral_reward_after ?? DEFAULT_REFERRAL_REWARD_AFTER;

  const { data: referrers } = await admin
    .from('mystic_referrals')
    .select('referrer_user_id')
    .eq('workspace_id', workspaceId);

  const uniqueReferrers = [...new Set((referrers ?? []).map((r) => r.referrer_user_id as string))];

  for (const referrerUserId of uniqueReferrers) {
    const { count } = await admin
      .from('mystic_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('referrer_user_id', referrerUserId)
      .eq('credited', false);

    const pending = count ?? 0;
    if (pending < threshold) continue;

    const batches = Math.floor(pending / threshold);
    await new MysticCreditsService(admin).grantCredit({
      workspaceId,
      userId: referrerUserId,
      sourceKind: 'package',
      sourceId: 'referral_reward',
      blowoutsRemaining: batches,
      expiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
    });

    const { data: toMark } = await admin
      .from('mystic_referrals')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('referrer_user_id', referrerUserId)
      .eq('credited', false)
      .order('created_at', { ascending: true })
      .limit(batches * threshold);

    if (toMark?.length) {
      await admin
        .from('mystic_referrals')
        .update({ credited: true })
        .in(
          'id',
          toMark.map((r) => r.id)
        );
    }
  }
}
