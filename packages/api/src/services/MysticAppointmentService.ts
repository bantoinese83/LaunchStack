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
  promoCode?: string | null;
  discountCents?: number;
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

  /** Upcoming + past visits (~18 months) for My visits tabs. */
  async listForClient(clientUserId: string) {
    const lookbackMs = 548 * 86400000;
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .select('*')
      .eq('client_user_id', clientUserId)
      .gte('starts_at', new Date(Date.now() - lookbackMs).toISOString())
      .order('starts_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as MysticAppointmentRow[];
  }

  /** Drop unpaid checkout holds so slots reopen (Stripe abandon or timeout). */
  async cancelStalePending(workspaceId: string, maxAgeMinutes = 90) {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000).toISOString();
    const { error } = await this.supabase
      .from('mystic_appointments')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .lt('created_at', cutoff);
    if (error) throw error;
  }

  async cancelPendingForClient(workspaceId: string, clientUserId: string) {
    const { error } = await this.supabase
      .from('mystic_appointments')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('client_user_id', clientUserId)
      .eq('status', 'pending');
    if (error) throw error;
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
        promo_code: input.promoCode ?? null,
        discount_cents: input.discountCents ?? 0,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async markEnRoute(
    id: string,
    etaMinutes: number,
    location?: { latitude: number; longitude: number }
  ) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'stylist_en_route',
        eta_minutes: etaMinutes,
        ...(location
          ? {
              stylist_latitude: location.latitude,
              stylist_longitude: location.longitude,
              stylist_location_updated_at: now,
            }
          : {}),
        updated_at: now,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async updateStylistLocation(id: string, latitude: number, longitude: number) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        stylist_latitude: latitude,
        stylist_longitude: longitude,
        stylist_location_updated_at: now,
        updated_at: now,
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

  /**
   * Door-timer expiry / manual no-show.
   *
   * `depositCaptured` must reflect whether money actually moved. It used to be
   * hardcoded `true`, so a visit with no payment intent (or a zero deposit) was
   * recorded as "deposit captured" — which misleads the studio and, worse, the
   * `!deposit_captured` guard in captureAppointmentDeposit then blocked any later
   * legitimate capture.
   */
  async markNoShow(id: string, options: { depositCaptured?: boolean } = {}) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'no_show',
        deposit_captured: options.depositCaptured ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async cancel(id: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }

  async reschedule(id: string, startsAt: string) {
    const { data, error } = await this.supabase
      .from('mystic_appointments')
      .update({
        starts_at: startsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticAppointmentRow;
  }
}
