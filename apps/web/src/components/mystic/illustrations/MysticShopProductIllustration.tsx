import type { ShopProductId } from '@template/mystic';

const TONE: Record<ShopProductId, { wash: string; accent: string; label: string }> = {
  volume_mist: {
    wash: 'from-accent/25 via-surface to-gold-soft/40',
    accent: '#7A8F6E',
    label: 'Mist',
  },
  heat_shield: {
    wash: 'from-plum/20 via-surface to-accent-soft/30',
    accent: '#5C4A5E',
    label: 'Shield',
  },
  silk_serum: {
    wash: 'from-gold-soft/50 via-surface to-accent/15',
    accent: '#C4A962',
    label: 'Serum',
  },
};

type Props = {
  productId: ShopProductId;
  className?: string;
};

/** Editorial product tile — bottle silhouette until Luke adds pack shots. */
export function MysticShopProductIllustration({ productId, className = '' }: Props) {
  const tone = TONE[productId];

  return (
    <div
      className={`relative flex h-[7.5rem] w-[5.5rem] shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b ${tone.wash} ring-1 ring-line/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 64 96" className="mb-1 h-[5.25rem] w-auto drop-shadow-sm" fill="none">
        <path
          d="M28 8h8v6c0 4 6 6 6 12v52c0 6-5 10-14 10s-14-4-14-10V26c0-6 6-8 6-12V8z"
          fill="rgba(255,255,255,0.72)"
          stroke={tone.accent}
          strokeWidth="1.2"
        />
        <path
          d="M30 14h4v4c0 2.5 4 3.5 4 7"
          stroke={tone.accent}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.55"
        />
        <ellipse cx="32" cy="78" rx="10" ry="3" fill={tone.accent} opacity="0.12" />
      </svg>
      <span className="type-eyebrow absolute left-2 top-2 text-[0.6rem] text-muted/80">
        {tone.label}
      </span>
    </div>
  );
}
