import type { ServiceId } from '@template/mystic';

const TONE: Record<ServiceId, { wash: string; stroke: string; fill: string }> = {
  blowout: {
    wash: 'from-accent/30 via-surface to-gold-soft/50',
    stroke: '#7A8F6E',
    fill: '#C4A962',
  },
  haircut: {
    wash: 'from-plum/15 via-surface to-accent-soft/40',
    stroke: '#6B4F5B',
    fill: '#7A8F6E',
  },
  updo: {
    wash: 'from-gold-soft/60 via-surface to-plum/10',
    stroke: '#6B4F5B',
    fill: '#C4A962',
  },
  dry_style: {
    wash: 'from-accent-soft/80 via-surface to-gold-soft/30',
    stroke: '#7A8F6E',
    fill: '#8B7355',
  },
};

type Props = {
  serviceId: ServiceId;
  className?: string;
  size?: 'sm' | 'md';
};

function ServiceArt({
  serviceId,
  stroke,
  fill,
}: {
  serviceId: ServiceId;
  stroke: string;
  fill: string;
}) {
  switch (serviceId) {
    case 'blowout':
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
          <path
            d="M12 44c8-14 20-22 32-22 6 0 10 2 12 6"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 38c6-8 14-12 24-12s18 4 22 10"
            stroke={fill}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="48" cy="18" r="5" stroke={stroke} strokeWidth="1.5" />
          <path d="M48 23v14" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M44 30h8" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'haircut':
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
          <path d="M22 42 L32 18 L42 42" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="32" cy="44" r="3" fill={fill} opacity="0.5" />
          <path
            d="M18 28c4-6 10-8 14-8M46 28c-4-6-10-8-14-8"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'updo':
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
          <ellipse cx="32" cy="28" rx="14" ry="12" stroke={stroke} strokeWidth="1.8" />
          <path
            d="M32 16c-6 4-8 10-8 16 0 8 6 14 14 14"
            stroke={fill}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M38 14l4-4M26 14l-4-4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="32" cy="40" r="2.5" fill={fill} />
        </svg>
      );
    case 'dry_style':
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
          <path d="M14 46c10-8 22-10 34-6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M28 20c6 8 10 16 10 24" stroke={fill} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M36 18c-2 6-2 14 2 22"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <rect x="40" y="12" width="8" height="16" rx="2" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

/** Sage / gold editorial service marks — not photo stock. */
export function MysticServiceIllustration({ serviceId, className = '', size = 'md' }: Props) {
  const tone = TONE[serviceId];
  const dim = size === 'sm' ? 'h-11 w-11' : 'h-14 w-14';

  return (
    <div
      className={`relative ${dim} shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ring-1 ring-line/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${tone.wash} ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 p-2.5">
        <ServiceArt serviceId={serviceId} stroke={tone.stroke} fill={tone.fill} />
      </div>
    </div>
  );
}
