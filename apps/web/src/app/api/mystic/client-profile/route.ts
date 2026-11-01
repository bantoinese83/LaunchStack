import { NextResponse } from 'next/server';
import { MysticReferralService, createSupabaseAdminClient } from '@template/api';
import {
  DEFAULT_REFERRAL_REWARD_AFTER,
  referralProgressCopy,
  referralsTowardNextReward,
  referralsUntilReward,
} from '@template/mystic';
import { firstZodIssueMessage, mysticClientProfileSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { ensureClientReferralCode } from '@/lib/mystic/referrals';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const admin = createSupabaseAdminClient();
    const workspaceId = getMysticWorkspaceId();

    const [{ data: identity, error: identityError }, referralCode] = await Promise.all([
      admin.from('profiles').select('full_name, email, avatar_url').eq('id', auth.user.id).single(),
      ensureClientReferralCode(admin, { userId: auth.user.id, workspaceId }),
    ]);
    if (identityError) throw identityError;

    const { data: mystic, error: mysticError } = await admin
      .from('mystic_client_profiles')
      .select('*')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (mysticError) throw mysticError;

    const [{ data: settings }, pending, total] = await Promise.all([
      admin
        .from('mystic_studio_settings')
        .select('referral_reward_after')
        .eq('workspace_id', workspaceId)
        .maybeSingle(),
      new MysticReferralService(admin).countPendingForReferrer(workspaceId, auth.user.id),
      new MysticReferralService(admin).countForReferrer(workspaceId, auth.user.id),
    ]);

    const threshold = settings?.referral_reward_after ?? DEFAULT_REFERRAL_REWARD_AFTER;

    return NextResponse.json({
      profile: {
        ...(mystic ?? {
          user_id: auth.user.id,
          phone: null,
          birthday: null,
          marketing_sms: true,
          marketing_email: true,
          referral_count: 0,
        }),
        referral_code: referralCode,
        full_name: identity?.full_name ?? null,
        email: identity?.email ?? auth.user.email ?? null,
        avatar_url: identity?.avatar_url ?? null,
      },
      referralProgress: {
        total,
        pending,
        threshold,
        towardNext: referralsTowardNextReward(pending, threshold),
        untilReward: referralsUntilReward(pending, threshold),
        copy: referralProgressCopy(pending, threshold),
      },
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.clientProfile.get');
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticClientProfileSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const workspaceId = getMysticWorkspaceId();

    await admin
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.user.id);

    const referralCode = await ensureClientReferralCode(admin, {
      userId: auth.user.id,
      workspaceId,
    });

    const { data, error } = await admin
      .from('mystic_client_profiles')
      .upsert({
        user_id: auth.user.id,
        workspace_id: workspaceId,
        phone: parsed.data.phone,
        birthday: parsed.data.birthday ?? null,
        marketing_sms: parsed.data.marketingSms,
        marketing_email: parsed.data.marketingEmail,
        referral_code: referralCode,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.clientProfile.put');
  }
}
