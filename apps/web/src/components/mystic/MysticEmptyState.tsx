'use client';

import Image from 'next/image';
import { MYSTIC_EMPTY_CONTENT, type MysticEmptyVariant } from '@template/mystic';
import { mysticCard } from '@/components/mystic/mystic-styles';

type Props = {
  variant: MysticEmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function MysticEmptyState({
  variant,
  title,
  description,
  action,
  className = '',
  compact = false,
}: Props) {
  const content = MYSTIC_EMPTY_CONTENT[variant];
  const heading = title ?? content.title;
  const body = description ?? content.description;
  const src = `/illustrations/empty/${content.illustration}`;

  return (
    <div
      className={`${mysticCard} flex flex-col items-center px-6 py-8 text-center ${compact ? 'py-6' : ''} ${className}`}
      role="status"
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-accent-soft/40 ${compact ? 'h-36 w-36' : 'h-44 w-44 sm:h-52 sm:w-52'}`}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? '144px' : '(max-width: 640px) 176px, 208px'}
        />
      </div>
      <h2
        className={`font-display font-medium text-ink ${compact ? 'mt-4 text-lg' : 'mt-6 text-xl'}`}
      >
        {heading}
      </h2>
      <p className={`mt-2 max-w-sm text-muted ${compact ? 'text-xs' : 'text-sm'}`}>{body}</p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
