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
  'rounded-lg border border-line/80 bg-surface/95 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const mysticCardHover = 'hover:border-gold/40';

/** Flat list row — road-trip hairline instead of floating card */
export const mysticFlatRow = 'border-b border-line/80 py-4 last:border-b-0 bg-transparent';

/** Live visit / en route — gold road marker (matches mobile) */
export const mysticLiveHighlight = 'border-l-[3px] border-gold bg-gold-soft/90 pl-4 -ml-px';

export const mysticPageEnter = 'animate-[rise_400ms_ease-out]';

/** Vertical rhythm for app + studio pages */
export const mysticPageStack = 'flex w-full flex-col gap-5 md:gap-6';

export const mysticPageStackLoose = 'flex w-full flex-col gap-6 md:gap-8';

/** Toolbar row under intros (refresh, filters) */
export const mysticToolbarRow = 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2';

export const mysticEyebrow = 'type-eyebrow text-plum';

/** Pill tab control (Visits, filters) */
export const mysticSegmentShell = 'flex border-b border-line/80';

export const mysticSegmentTab = (active: boolean) =>
  active
    ? 'flex-1 border-b-2 border-gold px-3 py-2.5 text-sm font-medium text-plum transition -mb-px'
    : 'flex-1 px-3 py-2.5 text-sm font-medium text-muted transition hover:text-ink';

export const mysticSectionTitle =
  'font-display text-3xl font-medium tracking-tight text-ink md:text-[2.125rem]';

export const mysticInput =
  'w-full border-0 border-b border-line/80 bg-transparent px-0 py-3 text-ink outline-none transition focus:border-gold focus:ring-0';

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
