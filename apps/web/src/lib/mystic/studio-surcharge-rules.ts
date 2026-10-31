import type { SupabaseClient } from '@supabase/supabase-js';
import { studioSettingsToSurchargeRules, type SurchargeRules } from '@template/mystic';

export async function loadStudioSurchargeRules(
  admin: SupabaseClient,
  workspaceId: string
): Promise<SurchargeRules> {
  const { data: settings } = await admin
    .from('mystic_studio_settings')
    .select('evening_surcharge_cents, included_miles, per_mile_surcharge_cents')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  return studioSettingsToSurchargeRules(settings ?? undefined);
}
