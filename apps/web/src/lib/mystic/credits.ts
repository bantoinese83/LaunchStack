import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  type MembershipId,
  type PackageId,
} from '@template/mystic';

/**
 * Add months without the `setMonth` roll-over trap: Jan 31 + 1 month must be the
 * last day of February, not Mar 3 (which silently gave credits extra days).
 */
function addMonths(from: Date, months: number) {
  const d = new Date(from);
  const targetDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDayOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(targetDay, lastDayOfTargetMonth));
  return d;
}

export function creditGrantForMembership(membershipId: MembershipId) {
  const plan = MYSTIC_MEMBERSHIPS.find((m) => m.id === membershipId);
  if (!plan) return null;
  return {
    sourceKind: 'membership' as const,
    sourceId: membershipId,
    blowoutsRemaining: plan.blowoutsPerMonth,
    expiresAt: addMonths(new Date(), 1).toISOString(),
  };
}

/**
 * `sourceId` identifies the *purchase*, not the pack. Pass the Stripe checkout
 * session id so a redelivered webhook updates the same credit row instead of
 * granting a second pack; it defaults to the pack id for legacy callers.
 */
export function creditGrantForPackage(packageId: PackageId, sourceId?: string) {
  const pack = MYSTIC_PACKAGES.find((p) => p.id === packageId);
  if (!pack) return null;
  return {
    sourceKind: 'package' as const,
    sourceId: sourceId ?? packageId,
    blowoutsRemaining: pack.blowoutCount,
    expiresAt: addMonths(new Date(), pack.expiresMonths).toISOString(),
  };
}
