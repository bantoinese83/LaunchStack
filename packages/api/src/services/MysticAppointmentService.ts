import type { SupabaseClient } from '@supabase/supabase-js';

export type MysticAppointmentRow = {
  id: string;
  workspace_id: string;
  client_user_id: string;
  service_id: string;
  starts_at: string;
  duration_minutes: number;
  address: Record<string, unknown>;
  distance_miles: number | null;
  entitlement: string;
  quote_cents: number;
  surcharge_json: unknown;
  tip_cents: number;
  tags: string[];
  referred_by_name: string | null;
  status: string;
  deposit_cents: number;
  deposit_captured: boolean;
  door_timer_ends_at: string | null;
  eta_minutes: number | null;
  client_notes: string | null;
  created_at: string;
};

export type CreateAppointmentInput = {
  workspaceId: string;
  clientUserId: string;
  serviceId: string;
  startsAt: string;
  durationMinutes: number;
  address: Record<string, unknown>;
  distanceMiles?: number;
  entitlement: string;
  quoteCents: number;
  surchargeJson: unknown;
  tipCents?: number;
  tags?: string[];
  referredByName?: string;
  depositCents?: number;
  clientNotes?: string;
};

export class MysticAppointmentService {
  constructor(private supabase: SupabaseClient) {}

  async listForStudio(workspaceId: string, from: string, to: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('starts_at', from)
      .lte('starts_at', to)
      .order('starts_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as MysticAppointmentRow[];
  }

  async listForClient(clientUserId: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .select('*')
      .eq('client_user_id', clientUserId)
      .gte('starts_at', new Date(Date.now() - 86400000).toISOString())
      .order('starts_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as MysticAppointmentRow[];
  }

  async create(input: CreateAppointmentInput) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .insert({
        workspace_id: input.workspaceId,
        client_user_id: input.clientUserId,
        service_id: input.serviceId,
        starts_at: input.startsAt,
        duration_minutes: input.durationMinutes,
        address: input.address,
        distance_miles: input.distanceMiles ?? null,
        entitlement: input.entitlement,
        quote_cents: input.quoteCents,
        surcharge_json: input.surchargeJson,
        tip_cents: input.tipCents ?? 0,
        tags: input.tags ?? [],
        referred_by_name: input.referredByName ?? null,
        deposit_cents: input.depositCents ?? 0,
        client_notes: input.clientNotes ?? null,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async markEnRoute(id: string, etaMinutes: number) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'stylist_en_route',
        eta_minutes: etaMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async startDoorTimer(id: string, endsAt: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'door_timer_active',
        door_timer_ends_at: endsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async markCompletedPaymentCaptured(id: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'completed',
        payment_captured: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async markNoShowDepositCaptured(id: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'no_show',
        deposit_captured: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }
}
