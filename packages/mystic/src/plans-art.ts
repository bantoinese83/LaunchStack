import type { MembershipId, PackageId, ServiceId } from './catalog';
import { MYSTIC_SERVICE_CARD_IMAGE_PATH } from './service-card-art';

/** Web paths — Luke editorial + in-salon service photography (same as book flip cards). */
export const MYSTIC_PLANS_MEMBERSHIP_IMAGE: Record<MembershipId, string> = {
  glow: '/marketing/stylist-hero-house-call.jpg',
  luxe: '/marketing/stylist-hero-blowout.jpg',
};

/** Section header — in-action portrait (3:4 + top crop in UI). */
export const MYSTIC_PLANS_PACKAGES_SECTION_IMAGE = '/marketing/stylist-hero-blowout.jpg';

/** One distinct service-card photo per pack tier (book-flow photography). */
export const MYSTIC_PLANS_PACKAGE_ROW_SERVICE: Record<PackageId, ServiceId> = {
  pack_4: 'blowout',
  pack_6: 'dry_style',
  pack_10: 'updo',
};

export function mysticPlansPackageRowImagePath(packageId: PackageId): string {
  return MYSTIC_SERVICE_CARD_IMAGE_PATH[MYSTIC_PLANS_PACKAGE_ROW_SERVICE[packageId]];
}
