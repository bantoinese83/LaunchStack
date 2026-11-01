import type { ServiceId } from '@template/mystic';
import type { ImageSourcePropType } from 'react-native';
import blowout from '../assets/marketing/service-cards/blowout.jpg';
import dryStyle from '../assets/marketing/service-cards/dry-style.jpg';
import haircut from '../assets/marketing/service-cards/haircut.jpg';
import updo from '../assets/marketing/service-cards/updo.jpg';

export const NATIVE_SERVICE_CARD_IMAGE: Record<ServiceId, ImageSourcePropType> = {
  blowout,
  haircut,
  updo,
  dry_style: dryStyle,
};
