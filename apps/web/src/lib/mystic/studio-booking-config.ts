import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  MysticMenuOverridesMap,
  StudioBookingHoursConfig,
  WeeklyHoursMap,
} from '@template/mystic';

export type MysticStudioSettingsExtended = {
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
  weekly_hours?: WeeklyHoursMap | Record<string, unknown>;
  menu_overrides?: MysticMenuOverridesMap | Record<string, unknown>;
};

export async function loadStudioSettingsExtended(
  admin: SupabaseClient,
  workspaceId: string
): Promise<MysticStudioSettingsExtended | null> {
  const { data, error } = await admin
    .from('mystic_studio_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  if (error) throw error;
  return data as MysticStudioSettingsExtended | null;
}

export function studioSettingsToBookingHours(
  settings: MysticStudioSettingsExtended | null | undefined
): StudioBookingHoursConfig {
  return {
    bookingStartHour: settings?.booking_start_hour ?? 9,
    bookingEndHour: settings?.booking_end_hour ?? 20,
    slotMinutes: settings?.slot_minutes ?? 30,
    weeklyHours: (settings?.weekly_hours ?? {}) as WeeklyHoursMap,
  };
}

export function studioMenuOverrides(
  settings: MysticStudioSettingsExtended | null | undefined
): MysticMenuOverridesMap {
  return (settings?.menu_overrides ?? {}) as MysticMenuOverridesMap;
}
