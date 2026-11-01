import type { MembershipId, PackageId } from '@template/mystic';
import type { ImageSourcePropType } from 'react-native';
import blowoutCard from '../assets/marketing/service-cards/blowout.jpg';
import dryStyleCard from '../assets/marketing/service-cards/dry-style.jpg';
import updoCard from '../assets/marketing/service-cards/updo.jpg';
import heroBlowout from '../assets/marketing/stylist-hero-blowout.jpg';
import heroHouseCall from '../assets/marketing/stylist-hero-house-call.jpg';
export const NATIVE_PLANS_MEMBERSHIP_IMAGE: Record<MembershipId, ImageSourcePropType> = {
  glow: heroHouseCall,
  luxe: heroBlowout,
};

/** Luke editorial — distinct from each pack row photo. */
export const NATIVE_PLANS_PACKAGES_SECTION_IMAGE: ImageSourcePropType = heroBlowout;

export const NATIVE_PLANS_STRIP_IMAGE: ImageSourcePropType = heroBlowout;
export const NATIVE_PLANS_PACKAGE_ROW_IMAGE: Record<PackageId, ImageSourcePropType> = {
  pack_4: blowoutCard,
  pack_6: dryStyleCard,
  pack_10: updoCard,
};
