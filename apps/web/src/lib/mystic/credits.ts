import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  type MembershipId,
  type PackageId,
} from '@template/mystic';

function addMonths(from: Date, months: number) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
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

export function creditGrantForPackage(packageId: PackageId) {
  const pack = MYSTIC_PACKAGES.find((p) => p.id === packageId);
  if (!pack) return null;
  return {
    sourceKind: 'package' as const,
    sourceId: packageId,
    blowoutsRemaining: pack.blowoutCount,
    expiresAt: addMonths(new Date(), pack.expiresMonths).toISOString(),
  };
}
