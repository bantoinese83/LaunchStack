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
  /** Shorter body for compact / inline mobile layouts. */
  compactDescription?: string;
  /** Mono eyebrow above the title (mobile poster rhythm). */
  eyebrow?: string;
  /** Illustration filename under `illustrations/empty/` (without path). */
  illustration: string;
};

export const MYSTIC_EMPTY_CONTENT: Record<MysticEmptyVariant, MysticEmptyContent> = {
  visits: {
    illustration: 'visits.jpg',
    eyebrow: 'House calls',
    title: 'No house calls yet',
    description: 'Book a blowout, cut, or updo — Luke rolls up with a full pro kit.',
    compactDescription: 'Your first visit shows here with timing, map, and inspo.',
  },
  messages: {
    illustration: 'messages.jpg',
    eyebrow: 'Inbox',
    title: 'Say hey to Luke',
    description: 'Inspo, parking, timing, or a quick tweak — one thread for your house calls.',
    compactDescription: 'Tap a starter below or type in the composer.',
  },
  calendar: {
    illustration: 'calendar.jpg',
    eyebrow: 'Studio',
    title: 'Calendar is clear',
    description: 'When bookings land, they show up here by day. Block travel days anytime.',
    compactDescription: 'No appointments in this range yet.',
  },
  clients: {
    illustration: 'clients.jpg',
    eyebrow: 'Roster',
    title: 'No clients yet',
    description: 'Profiles appear after someone books and saves their info for SMS updates.',
    compactDescription: 'Client cards populate after first booking.',
  },
  referrals: {
    illustration: 'referrals.jpg',
    eyebrow: 'Rewards',
    title: 'No referral activity yet',
    description: 'When friends book with a code, referrers and rewards show up here.',
    compactDescription: 'Referral wins for this period will list here.',
  },
  'studio-ops': {
    illustration: 'calendar.jpg',
    eyebrow: 'Today',
    title: 'Board is quiet',
    description: 'Upcoming house calls land here — en route, door timer, complete, and map.',
    compactDescription: 'Nothing scheduled on the ops board right now.',
  },
  'book-slots': {
    illustration: 'calendar.jpg',
    eyebrow: 'Availability',
    title: 'No open times',
    description: 'That day may be full or blocked — try another date on the strip above.',
    compactDescription: 'Pick another day or check back later.',
  },
  generic: {
    illustration: 'visits.jpg',
    eyebrow: 'Mystic',
    title: 'Nothing here yet',
    description: 'Check back soon or hop to another tab.',
    compactDescription: 'Nothing to show right now.',
  },
};
