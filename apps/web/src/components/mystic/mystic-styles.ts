/** Shared Tailwind class groups — marketing, book, app, studio */

/** @deprecated Prefer MysticMagneticLink / MysticMagneticButton for CTAs */
export const mysticPrimaryBtn =
  'inline-flex items-center justify-center rounded-full bg-shell px-8 py-3.5 text-sm font-medium text-paper shadow-[0_12px_40px_-16px_rgba(26,31,24,0.55)] transition hover:bg-shell/90 hover:shadow-[0_16px_44px_-14px_rgba(26,31,24,0.5)]';

/** @deprecated Prefer MysticMagneticLink / MysticMagneticButton for CTAs */
export const mysticSecondaryBtn =
  'inline-flex items-center justify-center rounded-full border border-line/80 bg-surface/80 px-8 py-3.5 text-sm font-medium text-ink backdrop-blur-sm transition hover:border-accent/35 hover:bg-surface';

const mysticBtn3dBase =
  'mystic-btn-3d relative inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium transition-[transform,box-shadow,filter] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-y-[3px] active:shadow-[var(--mystic-btn-shadow-active)] disabled:pointer-events-none disabled:opacity-45';

export const mysticBtn3dPrimary = `${mysticBtn3dBase} mystic-btn-3d-primary text-paper`;

export const mysticBtn3dSecondary = `${mysticBtn3dBase} mystic-btn-3d-secondary text-ink`;

/** Secondary on shell / plum bands */
export const mysticBtn3dSecondaryOnDark = `${mysticBtn3dBase} mystic-btn-3d-secondary-on-dark text-paper`;

/** Compact header / nav size */
export const mysticBtn3dPrimarySm = `${mysticBtn3dBase} mystic-btn-3d-primary px-5 py-2.5 text-sm text-paper`;

export const mysticBtn3dSecondarySm = `${mysticBtn3dBase} mystic-btn-3d-secondary px-4 py-2 text-sm text-ink`;

export const mysticGhostBtn =
  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface/80 hover:text-ink';

export const mysticCard =
  'rounded-[1.35rem] border border-line/70 bg-surface/90 shadow-[0_20px_50px_-40px_rgba(31,30,30,0.35)] backdrop-blur-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const mysticCardHover =
  'hover:border-accent/30 hover:shadow-[0_28px_60px_-36px_rgba(122,143,110,0.35)]';

export const mysticEyebrow = 'type-eyebrow text-accent';

export const mysticSectionTitle =
  'font-display text-3xl font-medium tracking-tight text-ink md:text-[2.125rem]';

export const mysticInput =
  'w-full rounded-2xl border border-line/80 bg-surface px-4 py-3.5 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15';

const mysticChipFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const mysticTimeChip = (active: boolean) =>
  active
    ? `rounded-full border border-shell bg-shell py-2.5 text-sm font-medium text-paper shadow-sm ${mysticChipFocus}`
    : `rounded-full border border-line/80 bg-surface py-2.5 text-sm text-ink transition hover:border-accent/35 ${mysticChipFocus}`;

export const mysticStudioNavLink = (active: boolean) =>
  active
    ? 'rounded-full border border-shell bg-shell px-3 py-1.5 text-sm font-medium text-paper shadow-sm'
    : 'rounded-full border border-line/80 bg-surface/80 px-3 py-1.5 text-sm text-muted transition hover:border-accent/35 hover:text-ink';

export const mysticStudioBtn =
  'rounded-full bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-accent-hover';

export const mysticStudioBtnOutline =
  'rounded-full border border-line/80 bg-surface px-4 py-2 text-xs font-medium text-ink transition hover:border-accent/35';
