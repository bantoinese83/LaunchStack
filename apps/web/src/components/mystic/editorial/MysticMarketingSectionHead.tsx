import { cn } from '@/lib/utils';

type Props = {
  handLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** Dark band (shell) — inverts hand accent */
  inverse?: boolean;
  className?: string;
};

/** Section intro with offset hand label (ROSSI-style sticker type). */
export function MysticMarketingSectionHead({
  handLabel,
  eyebrow,
  title,
  description,
  inverse = false,
  className,
}: Props) {
  return (
    <div className={cn('relative max-w-2xl', className)}>
      <span
        className={cn(
          'type-hand-lg pointer-events-none mb-1 block w-fit -rotate-1',
          inverse ? 'text-gold' : 'text-plum'
        )}
      >
        {handLabel}
      </span>
      <p className={cn('type-eyebrow', inverse ? 'text-gold' : 'text-plum')}>{eyebrow}</p>
      <h2
        className={cn(
          'mt-3 font-medium tracking-tight',
          inverse
            ? 'type-display-lg text-paper'
            : 'font-display mystic-gradient-ink text-3xl md:text-[2.125rem]'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn('mt-4 text-base leading-relaxed', inverse ? 'text-paper/80' : 'text-muted')}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
