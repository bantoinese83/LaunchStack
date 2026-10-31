import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService } from '@template/api';
import type { ServiceId } from '@template/mystic';

export async function assertEntitlementForBooking(
  admin: SupabaseClient,
  input: {
    workspaceId: string;
    userId: string;
    entitlement: 'none' | 'membership' | 'package';
    serviceId: ServiceId;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.entitlement === 'none') return { ok: true };
  if (input.serviceId !== 'blowout') {
    return {
      ok: false,
      error:
        'Membership and package credits apply to blowouts only — pick blowout or pay menu price.',
    };
  }
  const credit = await new MysticCreditsService(admin).findUsableCredit(
    input.workspaceId,
    input.userId,
    input.entitlement
  );
  if (!credit) {
    return {
      ok: false,
      error: 'No active blowout credits for that plan — choose Pay as you go or buy a plan.',
    };
  }
  return { ok: true };
}
