import { createSupabaseAdminClient } from '@template/api';
import { buildReferralInviteUrl, normalizeReferralCode } from '@template/mystic';
import { headers } from 'next/headers';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { resolveReferrerUserIdByCode } from '@/lib/mystic/referrals';
import { ReferralInviteClient } from './ReferralInviteClient';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props) {
  const { code: raw } = await params;
  const code = normalizeReferralCode(raw);
  return {
    title: code ? `You're invited — Mystic Hair Co.` : 'Mystic Hair Co.',
    description: 'Book house-call hair styling in Chicago.',
  };
}

export default async function ReferralLandingPage({ params }: Props) {
  const { code: raw } = await params;
  const code = normalizeReferralCode(raw);

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;

  if (!code) {
    return (
      <ReferralInviteClient
        code={raw?.trim() ?? ''}
        valid={false}
        inviteUrl={buildReferralInviteUrl(origin, 'XXXX')}
      />
    );
  }

  const admin = createSupabaseAdminClient();
  const workspaceId = getMysticWorkspaceId();
  const userId = await resolveReferrerUserIdByCode(admin, workspaceId, code);
  let referrerFirstName = 'A friend';
  const valid = Boolean(userId);
  if (userId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();
    const fullName = profile?.full_name?.trim() ?? '';
    if (fullName) referrerFirstName = fullName.split(/\s+/)[0] ?? referrerFirstName;
  }

  const inviteUrl = buildReferralInviteUrl(origin, code);

  return (
    <ReferralInviteClient
      code={code}
      valid={valid}
      referrerFirstName={referrerFirstName}
      inviteUrl={inviteUrl}
    />
  );
}
