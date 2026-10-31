import type { SupabaseClient } from '@supabase/supabase-js';

export type GrantCreditInput = {
  workspaceId: string;
  userId: string;
  sourceKind: 'membership' | 'package';
  sourceId: string;
  blowoutsRemaining: number;
  expiresAt: string | null;
  stripeSubscriptionId?: string | null;
};

export class MysticCreditsService {
  constructor(private supabase: SupabaseClient) {}

  async grantCredit(input: GrantCreditInput) {
    if (input.sourceKind === 'membership') {
      const { data: existing } = await this.supabase
        .from('mystic_client_credits')
        .select('id')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.userId)
        .eq('source_kind', 'membership')
        .eq('source_id', input.sourceId)
        .maybeSingle();

      const row = {
        workspace_id: input.workspaceId,
        user_id: input.userId,
        source_kind: input.sourceKind,
        source_id: input.sourceId,
        blowouts_remaining: input.blowoutsRemaining,
        expires_at: input.expiresAt,
        stripe_subscription_id: input.stripeSubscriptionId ?? null,
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        const { data, error } = await this.supabase
          .from('mystic_client_credits')
          .update(row)
          .eq('id', existing.id)
          .select('*')
          .single();
        if (error) throw error;
        return data;
      }
    }

    const { data, error } = await this.supabase
      .from('mystic_client_credits')
      .insert({
        workspace_id: input.workspaceId,
        user_id: input.userId,
        source_kind: input.sourceKind,
        source_id: input.sourceId,
        blowouts_remaining: input.blowoutsRemaining,
        expires_at: input.expiresAt,
        stripe_subscription_id: input.stripeSubscriptionId ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async findUsableCredit(
    workspaceId: string,
    userId: string,
    entitlement: 'membership' | 'package'
  ) {
    const { data: rows, error } = await this.supabase
      .from('mystic_client_credits')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('source_kind', entitlement)
      .gt('blowouts_remaining', 0)
      .order('expires_at', { ascending: true });
    if (error) throw error;
    const now = Date.now();
    return (
      (rows ?? []).find((row) => {
        if (!row.expires_at) return true;
        return new Date(row.expires_at as string).getTime() > now;
      }) ?? null
    );
  }

  async consumeBlowoutForAppointment(input: {
    workspaceId: string;
    userId: string;
    entitlement: 'membership' | 'package';
    appointmentId: string;
  }) {
    const { data: appt } = await this.supabase
      .from('mystic_appointments')
      .select('consumed_credit_id')
      .eq('id', input.appointmentId)
      .maybeSingle();
    if (appt?.consumed_credit_id) return appt.consumed_credit_id;

    const credit = await this.findUsableCredit(input.workspaceId, input.userId, input.entitlement);
    if (!credit) throw new Error('No blowout credits available');

    const { error: decErr } = await this.supabase
      .from('mystic_client_credits')
      .update({
        blowouts_remaining: credit.blowouts_remaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', credit.id)
      .gt('blowouts_remaining', 0);
    if (decErr) throw decErr;

    await this.supabase
      .from('mystic_appointments')
      .update({ consumed_credit_id: credit.id })
      .eq('id', input.appointmentId);

    return credit.id;
  }

  async listForUser(workspaceId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('mystic_client_credits')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .gt('blowouts_remaining', 0)
      .order('expires_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async listClientsForStudio(workspaceId: string) {
    const { data: profiles, error } = await this.supabase
      .from('mystic_client_profiles')
      .select('user_id, phone, referral_code')
      .eq('workspace_id', workspaceId)
      .limit(500);
    if (error) throw error;
    if (!profiles?.length) return [];

    const ids = profiles.map((p) => p.user_id);
    const { data: names } = await this.supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', ids);
    const byId = new Map((names ?? []).map((n) => [n.id, n]));

    return profiles.map((p) => ({
      ...p,
      full_name: byId.get(p.user_id)?.full_name ?? null,
      email: byId.get(p.user_id)?.email ?? null,
      avatar_url: byId.get(p.user_id)?.avatar_url ?? null,
    }));
  }
}
