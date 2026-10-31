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
}
