/** Semantic icon roles shared by web (Lucide) and mobile (MDI). No sparkle glyphs — ever. */
export const MYSTIC_ICON_ROLES = [
  'book',
  'visits',
  'plans',
  'shop',
  'inbox',
  'studio',
  'profile',
  'houseCall',
  'membershipPerk',
  'serviceArea',
  'packageOffer',
  'secure',
  'studioToday',
  'studioCalendar',
  'studioClients',
  'studioMessages',
  'studioBlasts',
  'studioReferrals',
  'studioAnalytics',
  'studioSettings',
] as const;

export type MysticIconRole = (typeof MYSTIC_ICON_ROLES)[number];
