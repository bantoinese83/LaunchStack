import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Group credit rows by user id, preserving the query order (expires_at ascending)
 * inside each group — the same order `listForUser` returns. Pure, so it can be
 * unit tested without a database.
 */
export function groupCreditsByUserId<T extends { user_id: string }>(
  rows: readonly T[]
): Record<string, T[]> {
  const byUser: Record<string, T[]> = {};
  for (const row of rows) {
    const existing = byUser[row.user_id];
    if (existing) existing.push(row);
    else byUser[row.user_id] = [row];
  }
  return byUser;
}

export type GrantCreditInput = {
  workspaceId: string;
  userId: string;
  sourceKind: 'membership' | 'package' | 'manual';
  sourceId: string;
  blowoutsRemaining: number;
  expiresAt: string | null;
  stripeSubscriptionId?: string | null;
};

export class MysticCreditsService {
  constructor(private supabase: SupabaseClient) {}

  async grantCredit(input: GrantCreditInput) {
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

    // Idempotent per (workspace, user, source kind, source id).
    //
    // Stripe delivers webhooks at least once, and only membership used to dedupe —
    // so a redelivered *package* purchase inserted a second full set of credits.
    // Membership keeps its one-row-per-plan monthly reset; packages key on the
    // checkout session id so each purchase is its own row and a replay updates it.
    const { data: existing } = await this.supabase
      .from('mystic_client_credits')
      .select('id')
      .eq('workspace_id', input.workspaceId)
      .eq('user_id', input.userId)
      .eq('source_kind', input.sourceKind)
      .eq('source_id', input.sourceId)
      .maybeSingle();

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

    const { data, error } = await this.supabase
      .from('mystic_client_credits')
      .insert(row)
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

  /**
   * Every active credit in a workspace in a SINGLE query.
   *
   * `listForUser` costs one round trip per user, so enriching a client list with
   * it is O(clients) queries (up to the 500-row cap). Studio screens always want
   * the whole workspace, so fetch it once and group in memory instead.
   */
  async listForWorkspace(workspaceId: string) {
    const { data, error } = await this.supabase
      .from('mystic_client_credits')
      .select('*')
      .eq('workspace_id', workspaceId)
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
