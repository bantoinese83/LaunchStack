/**
 * LaunchStack mobile tokens — keep in sync with apps/web/src/app/globals.css
 */
export const theme = {
  shell: '#141313',
  paper: '#FAF8F4',
  surface: '#FFFFFF',
  ink: '#1F1E1E',
  muted: '#666666',
  line: '#EBEBEB',
  accent: '#DA3750',
  accentHover: '#C42F48',
  accentSoft: '#FFF5F6',
  chalk: '#2E4A62',
  chalkSoft: '#EEF3F7',
  danger: '#B42318',
  success: '#027A48',
  radii: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 22,
    pill: 999,
  },
} as const;

/** Mono eyebrow labels (Monarch / web `.type-eyebrow`) */
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
