/** Keywords for the landing-page marquee — duplicated in the ticker component for seamless loop. */
export const MYSTIC_MARKETING_TICKER_KEYWORDS = [
  'House calls',
  'Blowouts',
  'Cuts',
  'Updos',
  'Dry styling',
  'Member credits',
  'Inspo photos',
  'Chicago',
  'River North',
  'Travel included',
  'Book online',
] as const;

/** Display marquee — words only (no empty accent blocks). */
export const MYSTIC_MARKETING_BIG_TICKER = [
  { kind: 'word' as const, text: 'Mobile' },
  { kind: 'sep' as const },
  { kind: 'word' as const, text: 'Mystic' },
  { kind: 'sep' as const },
  { kind: 'word' as const, text: 'House calls' },
  { kind: 'sep' as const },
  { kind: 'word' as const, text: 'Chicago' },
  { kind: 'sep' as const },
  { kind: 'word' as const, text: 'At your door' },
  { kind: 'sep' as const },
] as const;
