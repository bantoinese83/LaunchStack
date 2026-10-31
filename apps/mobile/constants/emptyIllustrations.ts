import type { ImageSourcePropType } from 'react-native';
import calendar from '../assets/illustrations/empty/calendar.jpg';
import clients from '../assets/illustrations/empty/clients.jpg';
import messages from '../assets/illustrations/empty/messages.jpg';
import referrals from '../assets/illustrations/empty/referrals.jpg';
import visits from '../assets/illustrations/empty/visits.jpg';

/** Bundled empty-state art — keys match `MYSTIC_EMPTY_CONTENT[].illustration`. */
export const MYSTIC_EMPTY_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'visits.jpg': visits,
  'messages.jpg': messages,
  'calendar.jpg': calendar,
  'clients.jpg': clients,
  'referrals.jpg': referrals,
};
