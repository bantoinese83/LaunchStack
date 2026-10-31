/** Shared copy for illustrated empty states (web + mobile). */
export const MYSTIC_EMPTY_VARIANTS = [
  'visits',
  'messages',
  'calendar',
  'clients',
  'referrals',
  'studio-ops',
  'book-slots',
  'generic',
] as const;

export type MysticEmptyVariant = (typeof MYSTIC_EMPTY_VARIANTS)[number];

export type MysticEmptyContent = {
  title: string;
  description: string;
  /** Illustration filename under `illustrations/empty/` (without path). */
  illustration: string;
};

export const MYSTIC_EMPTY_CONTENT: Record<MysticEmptyVariant, MysticEmptyContent> = {
  visits: {
    illustration: 'visits.jpg',
    title: 'No house calls yet',
    description: 'Book a blowout, cut, or updo — Luke comes to you with a full pro kit.',
  },
  messages: {
    illustration: 'messages.jpg',
    title: 'Start the conversation',
    description: 'Ask about inspo, parking, or timing — your thread with Luke lives here.',
  },
  calendar: {
    illustration: 'calendar.jpg',
    title: 'Calendar is clear',
    description:
      'When bookings land, they show up here by day. Share your availability in settings.',
  },
  clients: {
    illustration: 'clients.jpg',
    title: 'No clients yet',
    description: 'Profiles appear after someone books and saves their phone for SMS updates.',
  },
  referrals: {
    illustration: 'referrals.jpg',
    title: 'No referral activity this month',
    description: 'When friends book with a code, referrers and rewards show up here.',
  },
  'studio-ops': {
    illustration: 'calendar.jpg',
    title: 'Nothing on the board today',
    description: 'Upcoming house calls will appear here for en route, door timer, and complete.',
  },
  'book-slots': {
    illustration: 'calendar.jpg',
    title: 'No times that day',
    description: 'Try another date — Luke’s availability updates as the calendar fills.',
  },
  generic: {
    illustration: 'visits.jpg',
    title: 'Nothing here yet',
    description: 'Check back soon or try another section.',
  },
};
