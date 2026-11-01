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

/** Soft lift + hairline edge — layered shadows, not a muddy single drop. */
export const mysticCard =
  'mystic-lift rounded-lg border border-line/70 bg-surface/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const mysticCardHover = 'hover:border-gold/40 mystic-interactive';

/** Frosted panel for sticky bars / overlays */
export const mysticGlass =
  'mystic-glass rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';

/** Flat list row — road-trip hairline instead of floating card */
export const mysticFlatRow = 'border-b border-line/80 py-4 last:border-b-0 bg-transparent';

/** Live visit / en route — soft gold wash (no side accent line) */
export const mysticLiveHighlight = 'rounded-xl bg-gold-soft/90';

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

export const mysticInput =
  'w-full border-0 border-b border-line/80 bg-transparent px-0 py-3 text-ink outline-none transition focus:border-gold focus:ring-0';

const mysticChipFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const mysticTimeChip = (active: boolean) =>
  active
    ? `rounded-full bg-shell py-2.5 text-sm font-medium text-paper shadow-[0_8px_20px_-12px_rgba(26,31,24,0.55)] ${mysticChipFocus}`
    : `rounded-full bg-surface py-2.5 text-sm text-ink transition hover:bg-accent-soft/60 ${mysticChipFocus}`;

export const mysticStudioNavLink = (active: boolean) =>
  active
    ? 'mystic-interactive rounded-full border border-shell bg-shell px-3 py-1.5 text-sm font-medium text-paper'
    : 'mystic-interactive rounded-full border border-line/80 bg-surface/80 px-3 py-1.5 text-sm text-muted hover:border-accent/35 hover:text-ink';

export const mysticStudioBtn =
  'mystic-interactive rounded-full bg-accent px-4 py-2 text-xs font-medium text-white shadow-[var(--shadow-lift)] hover:bg-accent-hover';

export const mysticStudioBtnOutline =
  'mystic-interactive rounded-full border border-line/80 bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-accent/35';

export const mysticSectionTitle =
  'font-display mystic-gradient-ink text-3xl font-medium tracking-tight md:text-[2.125rem]';
