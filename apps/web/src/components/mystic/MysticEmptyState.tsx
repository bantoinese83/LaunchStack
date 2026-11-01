'use client';

import Image from 'next/image';
import { MYSTIC_EMPTY_CONTENT, type MysticEmptyVariant } from '@template/mystic';
import { mysticCard } from '@/components/mystic/mystic-styles';

type Props = {
  variant: MysticEmptyVariant;
  title?: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function MysticEmptyState({
  variant,
  title,
  description,
  eyebrow,
  action,
  className = '',
  compact = false,
}: Props) {
  const content = MYSTIC_EMPTY_CONTENT[variant];
  const heading = title ?? content.title;
  const body =
    description ??
    (compact && content.compactDescription ? content.compactDescription : content.description);
  const kicker = eyebrow ?? content.eyebrow;
  const src = `/illustrations/empty/${content.illustration}`;

  return (
    <div
      className={`${mysticCard} flex w-full flex-col items-center px-6 py-8 text-center motion-safe:animate-[mystic-fade-up_0.45s_ease-out] ${compact ? 'py-6' : ''} ${className}`}
      role="status"
    >
      {kicker ? (
        <p className={`type-eyebrow text-plum ${compact ? 'mb-3' : 'mb-4'}`}>{kicker}</p>
      ) : null}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-line/80 bg-chalk-soft/60 ${compact ? 'max-w-[168px]' : 'max-w-[280px]'}`}
      >
        <div className={`relative w-full ${compact ? 'aspect-[1.2]' : 'aspect-[1.15]'}`}>
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes={compact ? '168px' : '(max-width: 640px) 280px, 280px'}
          />
        </div>
      </div>
      {!compact ? <div className="mt-4 h-px w-full max-w-[280px] bg-line/80" aria-hidden /> : null}
      <h2
        className={`font-display font-medium tracking-tight text-ink ${compact ? 'mt-4 text-lg' : 'mt-5 text-xl sm:text-2xl'}`}
      >
        {heading}
      </h2>
      <p
        className={`mt-2 max-w-sm leading-relaxed text-muted ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}
      >
        {body}
      </p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
