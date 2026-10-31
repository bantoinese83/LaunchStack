/**
 * Mystic Hair Co. mobile tokens — keep in sync with apps/web/src/app/globals.css
 */
export const theme = {
  shell: '#1A1F18',
  paper: '#F7F4ED',
  surface: '#FFFFFF',
  ink: '#1F1E1E',
  muted: '#5C5A55',
  line: '#E5E0D6',
  accent: '#7A8F6E',
  accentHover: '#65785B',
  accentSoft: '#EEF2EB',
  chalk: '#8B7355',
  chalkSoft: '#F3EDE3',
  gold: '#C4A962',
  goldSoft: '#F8F3E6',
  plum: '#6B4F5B',
  danger: '#B42318',
  success: '#027A48',
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    pill: 999,
  },
} as const;

/** Mono eyebrow labels */
export const monoLabel = {
  fontSize: 10,
  fontWeight: '500' as const,
  letterSpacing: 1.8,
  textTransform: 'uppercase' as const,
};

export const displayTitle = {
  fontSize: 28,
  fontWeight: '500' as const,
  letterSpacing: -0.6,
};
