'use client';

import { MYSTIC_BOOK_CARD_LUKE_IMAGE, type ServiceId } from '@template/mystic';
import { MysticMarketingPhoto } from '@/components/mystic/MysticMarketingPhoto';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  serviceId: ServiceId;
  selected?: boolean;
  children: ReactNode;
  className?: string;
};

/** Back of flip card — Luke on a house call / in studio. */
export function MysticBookLukeCardScene({ serviceId, selected, children, className }: Props) {
  const src = MYSTIC_BOOK_CARD_LUKE_IMAGE[serviceId];

  return (
    <div className={cn('relative flex h-full min-h-0 w-full flex-col overflow-hidden', className)}>
      <MysticMarketingPhoto
        src={src}
        alt=""
        crop="portrait"
        sizes="(max-width: 640px) 100vw, 480px"
        className="absolute inset-0 h-full w-full"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          selected
            ? 'bg-gradient-to-t from-gold-soft/96 via-gold-soft/82 to-gold-soft/45'
            : 'bg-gradient-to-t from-shell/95 via-shell/75 to-shell/35'
        )}
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
