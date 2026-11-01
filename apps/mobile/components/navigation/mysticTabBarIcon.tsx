import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Consistent outline → filled pairs (active only fills).
 * Familiar metaphors: calendar, car, chat, scissors, person.
 */
const ROUTE_ICONS: Record<string, { active: MCIName; inactive: MCIName }> = {
  book: { active: 'calendar-month', inactive: 'calendar-month-outline' },
  visits: { active: 'map-marker', inactive: 'map-marker-outline' },
  membership: { active: 'ticket-confirmation', inactive: 'ticket-confirmation-outline' },
  shop: { active: 'shopping', inactive: 'shopping-outline' },
  messages: { active: 'message-text', inactive: 'message-text-outline' },
  studio: { active: 'content-cut', inactive: 'content-cut' },
  account: { active: 'account-circle', inactive: 'account-circle-outline' },
};

export function mysticTabBarIcon(
  routeName: string,
  focused: boolean,
  color: ColorValue,
  size: number
) {
  const pair = ROUTE_ICONS[routeName] ?? ROUTE_ICONS.account;
  // content-cut has no outline variant — soften inactive with opacity via color already
  const name = focused ? pair.active : pair.inactive;
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

/** Extra bottom padding for scroll views above the tab bar. */
export const MYSTIC_TAB_BAR_SCROLL_PADDING = 88;
