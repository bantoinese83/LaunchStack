import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { normalizeReferralCode } from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { resolveReferrerUserIdByCode } from '@/lib/mystic/referrals';
import { routeErrorResponse } from '@/lib/api/route-auth';

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code: raw } = await ctx.params;
    const code = normalizeReferralCode(raw);
    if (!code) {
      return NextResponse.json({ valid: false as const, code: raw?.trim() ?? '' });
    }

    const admin = createSupabaseAdminClient();
    const workspaceId = getMysticWorkspaceId();
    const userId = await resolveReferrerUserIdByCode(admin, workspaceId, code);
    if (!userId) {
      return NextResponse.json({ valid: false as const, code });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    const fullName = profile?.full_name?.trim() ?? '';
    const referrerFirstName = fullName.split(/\s+/)[0] || 'A friend';

    return NextResponse.json({
      valid: true as const,
      code,
      referrerFirstName,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.public.referral');
  }
}
