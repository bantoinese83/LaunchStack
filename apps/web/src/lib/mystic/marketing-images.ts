/** Local marketing photos (see scripts/fetch-pixabay-all.mjs — deduped Pixabay IDs). */

export const MYSTIC_MARKETING_IMAGES = {
  hero: '/marketing/hero.jpg',
  /** Wide ambient still for hero section bleed — `pnpm fetch:pixabay` */
  heroBg: '/marketing/hero-bg.jpg',
  stylist: '/marketing/stylist.jpg',
  stylistCutout: '/marketing/stylist-cutout.png',
  /** AI editorial hero scenes (reference: real headshot) — rotate in `StylistHeroFigure` */
  stylistHeroScenes: [
    '/marketing/stylist-hero-house-call.jpg',
    '/marketing/stylist-hero-pose.jpg',
    '/marketing/stylist-hero-blowout.jpg',
  ] as const,
  /** Auth fallback still (distinct from hero) — `pnpm fetch:pixabay` */
  authPoster: '/marketing/auth-poster.jpg',
  /** Auth shell loop — `pnpm fetch:pixabay` */
  authVideo: '/marketing/auth-bg.mp4',
  /** Brand logo fallback when marketing photos are missing */
  logo: '/brand/mystic-hair-logo-light.png',
} as const;

export type PixabayAttribution = {
  id: number;
  pageURL: string;
  user: string;
  tags: string;
  role: 'hero' | 'stylist' | 'auth_poster' | 'auth_video' | string;
};
