import Image from 'next/image';
import type { ServiceId } from '@template/mystic';

const SERVICE_ICON: Record<ServiceId, { src: string; alt: string }> = {
  blowout: { src: '/marketing/service-icons/blowout.jpg', alt: 'Blowout styling' },
  haircut: { src: '/marketing/service-icons/haircut.jpg', alt: 'Haircut' },
  updo: { src: '/marketing/service-icons/updo.jpg', alt: 'Updo styling' },
  dry_style: { src: '/marketing/service-icons/dry-style.jpg', alt: 'Dry style' },
};

type Props = {
  serviceId: ServiceId;
  className?: string;
};

/** Custom Mystic service icons (generated brand assets). */
export function MysticServiceIllustration({ serviceId, className = '' }: Props) {
  const icon = SERVICE_ICON[serviceId];

  return (
    <div
      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ${className}`}
      aria-hidden
    >
      <Image
        src={icon.src}
        alt=""
        width={112}
        height={112}
        className="h-full w-full object-cover object-center"
        sizes="56px"
      />
    </div>
  );
}
