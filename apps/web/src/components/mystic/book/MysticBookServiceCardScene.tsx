'use client';

import { type ServiceId } from '@template/mystic';
import { MysticServiceCardImage } from '@/components/mystic/MysticServiceCardImage';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  serviceId: ServiceId;
  selected?: boolean;
  children: ReactNode;
  className?: string;
};

/** Full-bleed mirror moment photography with readable text overlay. */
export function MysticBookServiceCardScene({ serviceId, selected, children, className }: Props) {
  return (
    <div className={cn('relative flex h-full min-h-0 w-full flex-col overflow-hidden', className)}>
      <MysticServiceCardImage
        serviceId={serviceId}
        fill
        sizes="(max-width: 640px) 100vw, 480px"
        testId={`service-card-photo-${serviceId}`}
        priority={serviceId === 'blowout'}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          selected
            ? 'bg-gradient-to-t from-gold-soft/98 via-gold-soft/88 to-gold-soft/55'
            : 'bg-gradient-to-t from-surface/98 via-surface/88 to-surface/50'
        )}
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
