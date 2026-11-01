'use client';

import Image from 'next/image';
import { MYSTIC_EMPTY_CONTENT, type MysticEmptyVariant } from '@template/mystic';
import { mysticCard } from '@/components/mystic/mystic-styles';
import { cn } from '@/lib/utils';

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
      className={cn(
        mysticCard,
        'mystic-pattern-band relative isolate flex w-full flex-col items-center overflow-hidden px-6 py-8 text-center motion-safe:animate-[mystic-fade-up_0.45s_ease-out]',
        compact && 'py-6',
        className
      )}
      role="status"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-pattern-surface-card opacity-[0.92]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/35 via-transparent to-surface/80"
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        {kicker ? (
          <p className={`type-eyebrow text-plum ${compact ? 'mb-3' : 'mb-4'}`}>{kicker}</p>
        ) : null}
        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-line/80 bg-chalk-soft/60 shadow-[0_8px_28px_-18px_rgba(26,31,24,0.2)] ${compact ? 'max-w-[168px]' : 'max-w-[280px]'}`}
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
        {!compact ? (
          <div className="mt-4 h-px w-full max-w-[280px] bg-line/80" aria-hidden />
        ) : null}
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
    </div>
  );
}
