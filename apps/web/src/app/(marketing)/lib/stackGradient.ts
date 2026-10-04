/** Stable gradient tokens (avoids effect thrashing on animated backgrounds). */

export const LAUNCHSTACK_HERO_GRADIENT = {
  gradientColors: ['#141313', '#1a2834', '#2e4a62', '#8a3045', '#da3750', '#141313', '#0a0a0a'],
  gradientStops: [22, 38, 50, 62, 72, 88, 100],
} as const;

export const LAUNCHSTACK_STACK_GRADIENT = {
  gradientColors: ['#faf8f4', '#eef3f7', '#7a9cb8', '#e8aab4', '#f5ebe8', '#ffffff'],
  gradientStops: [18, 38, 52, 68, 84, 100],
} as const;
