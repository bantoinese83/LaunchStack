import type { SupabaseClient } from '@supabase/supabase-js';

export type BlastRecipient = { userId: string; email?: string; phone?: string; name?: string };

export async function resolveBlastRecipients(
  admin: SupabaseClient,
  workspaceId: string,
  segment: 'all' | 'members' | 'packages' | 'upcoming_week'
): Promise<BlastRecipient[]> {
  const { data: clients, error } = await admin
    .from('mystic_client_profiles')
    .select('user_id, phone, marketing_sms, marketing_email')
    .eq('workspace_id', workspaceId);
  if (error) throw error;

  const ids = (clients ?? []).map((c) => c.user_id as string);
  const { data: names } = await admin.from('profiles').select('id, full_name, email').in('id', ids);
  const profileById = new Map((names ?? []).map((n) => [n.id, n]));

  let memberUserIds = new Set<string>();
  let packageUserIds = new Set<string>();
  let upcomingUserIds = new Set<string>();

  if (segment === 'members' || segment === 'packages') {
    const { data: credits } = await admin
      .from('mystic_client_credits')
      .select('user_id, source_kind')
      .eq('workspace_id', workspaceId)
      .gt('blowouts_remaining', 0);
    for (const row of credits ?? []) {
      if (row.source_kind === 'membership') memberUserIds.add(row.user_id as string);
      if (row.source_kind === 'package') packageUserIds.add(row.user_id as string);
    }
  }

  if (segment === 'upcoming_week') {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);
    const { data: appts } = await admin
      .from('mystic_appointments')
      .select('client_user_id')
      .eq('workspace_id', workspaceId)
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .neq('status', 'canceled');
    upcomingUserIds = new Set((appts ?? []).map((a) => a.client_user_id as string));
  }

  return (clients ?? [])
    .filter((row) => {
      const uid = row.user_id as string;
      if (segment === 'members') return memberUserIds.has(uid);
      if (segment === 'packages') return packageUserIds.has(uid);
      if (segment === 'upcoming_week') return upcomingUserIds.has(uid);
      return true;
    })
    .map((row) => {
      const profile = profileById.get(row.user_id as string);
      return {
        userId: row.user_id as string,
        email: row.marketing_email ? profile?.email : undefined,
        phone: row.marketing_sms ? (row.phone as string | undefined) : undefined,
        name: profile?.full_name,
      };
    });
}
