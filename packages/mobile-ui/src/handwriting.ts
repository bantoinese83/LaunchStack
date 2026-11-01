import { theme } from './theme';

/** Must match `Caveat_600SemiBold` loaded in apps/mobile root layout. */
export const MYSTIC_HAND_FONT = 'Caveat_600SemiBold';

/** Salon-note script for names, copilot titles, and warm greetings. */
export const handHero = {
  fontFamily: MYSTIC_HAND_FONT,
  fontSize: 34,
  lineHeight: 38,
  letterSpacing: 0.3,
  color: theme.chalk,
};

export const handTitle = {
  fontFamily: MYSTIC_HAND_FONT,
  fontSize: 28,
  lineHeight: 32,
  letterSpacing: 0.2,
  color: theme.ink,
};

export const handAccent = {
  fontFamily: MYSTIC_HAND_FONT,
  fontSize: 22,
  lineHeight: 26,
  letterSpacing: 0.2,
  color: theme.plum,
};

export const handLabel = {
  fontFamily: MYSTIC_HAND_FONT,
  fontSize: 18,
  lineHeight: 22,
  letterSpacing: 0.15,
  color: theme.ink,
};

export const handMuted = {
  fontFamily: MYSTIC_HAND_FONT,
  fontSize: 17,
  lineHeight: 21,
  letterSpacing: 0.15,
  color: theme.muted,
};
