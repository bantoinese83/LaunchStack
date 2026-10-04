import Image from 'next/image';
import type { HeroPhoneScreen } from './heroPhones';

type Slot = 'front' | 'left' | 'right' | 'hidden';

function PhoneScreen({ screen }: { screen: HeroPhoneScreen }) {
  if (screen.src && screen.media === 'video') {
    return (
      <video
        className="phone3d__media"
        src={screen.src}
        poster={screen.poster || undefined}
        muted
        playsInline
        loop
        autoPlay
      />
    );
  }

  if (screen.src && screen.media === 'image') {
    return (
      <Image
        className="phone3d__media object-cover"
        src={screen.src}
        alt={screen.alt}
        fill
        unoptimized
        priority
        sizes="(max-width: 768px) 164px, 248px"
      />
    );
  }

  return (
    <div className="phone3d__empty">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {screen.label}
      </span>
    </div>
  );
}

export function Phone3D({
  screen,
  slot,
  hidden,
  solo,
  onClick,
}: {
  screen: HeroPhoneScreen;
  slot: Slot;
  hidden?: boolean;
  solo?: boolean;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick) && slot !== 'front' && slot !== 'hidden';
  const Tag = interactive ? 'button' : 'div';
  const className = [
    'phone3d',
    `phone3d--${slot}`,
    `phone3d--${screen.platform}`,
    solo ? 'phone3d--solo' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={className}
      aria-hidden={hidden}
      {...(interactive
        ? { type: 'button' as const, onClick, 'aria-label': `Show ${screen.label}` }
        : {})}
    >
      <span className="phone3d__body">
        <span className="phone3d__screen">
          <span className="relative block h-full w-full">
            <PhoneScreen screen={screen} />
          </span>
        </span>
        <span className="phone3d__glare" aria-hidden="true" />
      </span>
      <span className="phone3d__edge" aria-hidden="true" />
    </Tag>
  );
}
