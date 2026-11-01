import type { ServiceId } from './catalog';
import type { ClientEntitlement } from './pricing';

export type MysticCreditRow = {
  source_kind: string;
  blowouts_remaining: number;
  expires_at?: string | null;
};

function creditIsUsable(row: MysticCreditRow, nowMs: number): boolean {
  if (row.blowouts_remaining <= 0) return false;
  if (!row.expires_at) return true;
  return new Date(row.expires_at).getTime() > nowMs;
}

/** Pick membership/package automatically from saved credits (blowouts only). */
export function inferClientEntitlementFromCredits(
  credits: readonly MysticCreditRow[],
  serviceId: ServiceId,
  nowMs = Date.now()
): ClientEntitlement {
  if (serviceId !== 'blowout') return 'none';
  const hasMembership = credits.some(
    (c) => c.source_kind === 'membership' && creditIsUsable(c, nowMs)
  );
  if (hasMembership) return 'membership';
  const hasPackage = credits.some((c) => c.source_kind === 'package' && creditIsUsable(c, nowMs));
  if (hasPackage) return 'package';
  return 'none';
}

export function clientEntitlementSummary(entitlement: ClientEntitlement): string | null {
  if (entitlement === 'membership') {
    return 'Your membership blowout applies — travel and evening fees are waived.';
  }
  if (entitlement === 'package') {
    return 'A package blowout credit applies — travel and evening fees are waived.';
  }
  return null;
}

/** Prompt pay-as-you-go blowout clients to browse Glow, Luxe, or packages. */
export function shouldShowBookingPlansNudge(
  serviceId: ServiceId,
  entitlement: ClientEntitlement
): boolean {
  return serviceId === 'blowout' && entitlement === 'none';
}

export const BOOKING_PLANS_NUDGE = {
  title: 'Save with a plan',
  body: 'Glow, Luxe, and prepaid blowout packages waive travel and evening fees on house calls.',
  cta: 'View plans',
} as const;
