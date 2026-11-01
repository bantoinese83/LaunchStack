import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticClientOnboardingSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { ensureClientReferralCode } from '@/lib/mystic/referrals';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticClientOnboardingSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const workspaceId = getMysticWorkspaceId();
    const now = new Date().toISOString();

    if (parsed.data.action === 'complete') {
      await admin
        .from('profiles')
        .update({
          full_name: parsed.data.fullName,
          updated_at: now,
        })
        .eq('id', auth.user.id);

      const referralCode = await ensureClientReferralCode(admin, {
        userId: auth.user.id,
        workspaceId,
      });

      const { data, error } = await admin
        .from('mystic_client_profiles')
        .upsert(
          {
            user_id: auth.user.id,
            workspace_id: workspaceId,
            phone: parsed.data.phone,
            marketing_sms: parsed.data.marketingSms,
            referral_code: referralCode,
            onboarding_completed_at: now,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        )
        .select('onboarding_completed_at')
        .single();
      if (error) throw error;

      return NextResponse.json({ onboardingCompletedAt: data.onboarding_completed_at });
    }

    const referralCode = await ensureClientReferralCode(admin, {
      userId: auth.user.id,
      workspaceId,
    });

    const { data, error } = await admin
      .from('mystic_client_profiles')
      .upsert(
        {
          user_id: auth.user.id,
          workspace_id: workspaceId,
          referral_code: referralCode,
          onboarding_completed_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select('onboarding_completed_at')
      .single();
    if (error) throw error;

    return NextResponse.json({ onboardingCompletedAt: data.onboarding_completed_at });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.clientProfile.onboarding');
  }
}
