import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { DEFAULT_SURCHARGE_RULES, studioSettingsToSurchargeRules } from '@template/mystic';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

/** Public surcharge + deposit defaults for booking UI (no auth). */
export async function GET() {
  try {
    const workspaceId = getMysticWorkspaceId();
    const admin = createSupabaseAdminClient();
    const { data: settings } = await admin
      .from('mystic_studio_settings')
      .select(
        'evening_surcharge_cents, included_miles, per_mile_surcharge_cents, deposit_cents, winter_buffer_enabled, referral_reward_after'
      )
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    const rules = studioSettingsToSurchargeRules(settings ?? undefined);

    return NextResponse.json({
      rules,
      depositCents: settings?.deposit_cents ?? 2500,
      winterBufferEnabled: settings?.winter_buffer_enabled ?? false,
      referralRewardAfter: settings?.referral_reward_after ?? 5,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.public.bookingSettings');
  }
}
