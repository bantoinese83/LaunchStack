import {
  MYSTIC_PLANS_SECTION_IDS,
  PACKAGE_IDS,
  SERVICE_IDS,
  type PackageId,
  type ServiceId,
} from '@template/mystic';
import type { Route } from 'next';

export function mysticBookHref(serviceId?: ServiceId): Route {
  if (!serviceId) return '/book';
  return `/book?service=${serviceId}` as Route;
}

export function parseBookServiceParam(value: string | null | undefined): ServiceId | null {
  if (!value) return null;
  return SERVICE_IDS.includes(value as ServiceId) ? (value as ServiceId) : null;
}

export function parsePackageParam(value: string | null | undefined): PackageId | null {
  if (!value) return null;
  return PACKAGE_IDS.includes(value as PackageId) ? (value as PackageId) : null;
}

export function mysticMembershipsHref(fragment?: 'memberships' | 'packages'): Route {
  if (fragment === 'memberships') {
    return `/memberships#${MYSTIC_PLANS_SECTION_IDS.memberships}` as Route;
  }
  if (fragment === 'packages') {
    return `/memberships#${MYSTIC_PLANS_SECTION_IDS.packages}` as Route;
  }
  return '/memberships';
}

/** Landing → memberships checkout row for a prepaid pack. */
export function mysticPackageCheckoutHref(packageId: PackageId): Route {
  return `/memberships?package=${packageId}#${MYSTIC_PLANS_SECTION_IDS.packages}` as Route;
}
