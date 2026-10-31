import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { firstZodIssueMessage, mysticClientProfileSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { generateReferralCode } from '@/lib/mystic/referrals';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('mystic_client_profiles')
      .select('*')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ profile: data });
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

    await admin.from('profiles').update({ full_name: parsed.data.fullName }).eq('id', auth.user.id);

    const { data: existing } = await admin
      .from('mystic_client_profiles')
      .select('referral_code')
      .eq('user_id', auth.user.id)
      .maybeSingle();

    const referralCode =
      existing?.referral_code ?? generateReferralCode(`${auth.user.id}-${workspaceId}`);

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
