import type { SupabaseClient } from '@supabase/supabase-js';

export class MysticReferralService {
  constructor(private supabase: SupabaseClient) {}

  async recordReferral(input: {
    workspaceId: string;
    referrerUserId: string;
    referredName: string;
    referredUserId?: string;
    appointmentId?: string;
  }) {
    const { data, error } = await this.supabase
      .from('mystic_referrals')
      .insert({
        workspace_id: input.workspaceId,
        referrer_user_id: input.referrerUserId,
        referred_name: input.referredName,
        referred_user_id: input.referredUserId ?? null,
        appointment_id: input.appointmentId ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;

    const { data: profile } = await this.supabase
      .from('mystic_client_profiles')
      .select('referral_count')
      .eq('workspace_id', input.workspaceId)
      .eq('user_id', input.referrerUserId)
      .maybeSingle();

    if (profile) {
      await this.supabase
        .from('mystic_client_profiles')
        .update({
          referral_count: (profile.referral_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.referrerUserId);
    }

    return data;
  }

  async listForStudio(workspaceId: string) {
    const { data, error } = await this.supabase
      .from('mystic_referrals')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  }

  async countForReferrer(workspaceId: string, referrerUserId: string) {
    const { count, error } = await this.supabase
      .from('mystic_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('referrer_user_id', referrerUserId);
    if (error) throw error;
    return count ?? 0;
  }

  async countPendingForReferrer(workspaceId: string, referrerUserId: string) {
    const { count, error } = await this.supabase
      .from('mystic_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('referrer_user_id', referrerUserId)
      .eq('credited', false);
    if (error) throw error;
    return count ?? 0;
  }

  /** Per-referrer counts for a calendar month (YYYY-MM). */
  async dashboardForMonth(workspaceId: string, month: string) {
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1)).toISOString();
    const end = new Date(Date.UTC(year, mon, 1)).toISOString();

    const { data: rows, error } = await this.supabase
      .from('mystic_referrals')
      .select('id, referrer_user_id, referred_name, credited, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const referrerIds = [...new Set((rows ?? []).map((r) => r.referrer_user_id as string))];
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', referrerIds.length ? referrerIds : ['00000000-0000-0000-0000-000000000000']);

    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name?.trim() || p.email || 'Referrer'])
    );

    const byReferrer = new Map<
      string,
      { referrerUserId: string; name: string; total: number; pending: number; credited: number }
    >();

    for (const row of rows ?? []) {
      const id = row.referrer_user_id as string;
      const entry = byReferrer.get(id) ?? {
        referrerUserId: id,
        name: nameById.get(id) ?? 'Referrer',
        total: 0,
        pending: 0,
        credited: 0,
      };
      entry.total += 1;
      if (row.credited) entry.credited += 1;
      else entry.pending += 1;
      byReferrer.set(id, entry);
    }

    return {
      month,
      referrers: [...byReferrer.values()].sort((a, b) => b.total - a.total),
      recent: rows ?? [],
    };
  }
}
