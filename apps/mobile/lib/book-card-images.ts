import type { ServiceId } from '@template/mystic';
import type { ImageSourcePropType } from 'react-native';
import heroBlowout from '../assets/marketing/stylist-hero-blowout.jpg';
import heroHouseCall from '../assets/marketing/stylist-hero-house-call.jpg';
import heroPose from '../assets/marketing/stylist-hero-pose.jpg';

export const NATIVE_BOOK_CARD_LUKE_IMAGE: Record<ServiceId, ImageSourcePropType> = {
  blowout: heroBlowout,
  haircut: heroHouseCall,
  updo: heroPose,
  dry_style: heroHouseCall,
};
