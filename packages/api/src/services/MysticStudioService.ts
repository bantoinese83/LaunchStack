import type { SupabaseClient } from '@supabase/supabase-js';

export type MysticStudioSettingsRow = {
  workspace_id: string;
  winter_buffer_enabled: boolean;
  evening_surcharge_cents: number;
  included_miles: number;
  per_mile_surcharge_cents: number;
  deposit_cents: number;
  door_timer_minutes: number;
  referral_reward_after: number;
  booking_start_hour?: number;
  booking_end_hour?: number;
  slot_minutes?: number;
  weekly_hours?: Record<string, unknown>;
  menu_overrides?: Record<string, unknown>;
};

export class MysticStudioService {
  constructor(private supabase: SupabaseClient) {}

  async getSettings(workspaceId: string): Promise<MysticStudioSettingsRow | null> {
    const { data, error } = await this.supabase
      .from('mystic_studio_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async upsertSettings(
    workspaceId: string,
    patch: Partial<Omit<MysticStudioSettingsRow, 'workspace_id'>> & Record<string, unknown>
  ) {
    const { data, error } = await this.supabase
      .from('mystic_studio_settings')
      .upsert({ workspace_id: workspaceId, ...patch, updated_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return data as MysticStudioSettingsRow;
  }
}
