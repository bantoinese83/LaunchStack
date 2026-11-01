import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MysticPatternBandVariant = 'plum' | 'shell';

type Props = {
  variant?: MysticPatternBandVariant;
  /** Nested rhombus (plum cards) or braided lines (footer-scale). */
  pattern?: 'rhombus' | 'braid';
  className?: string;
  children: ReactNode;
};

/**
 * CTA / closing band with CSS gradient patterns (nested rhombus technique from
 * https://css-pattern.com/nested-rhombus/ — recolored for Mystic plum & gold).
 */
export function MysticPatternBand({ variant = 'plum', pattern, className, children }: Props) {
  const resolvedPattern = pattern ?? (variant === 'plum' ? 'rhombus' : 'braid');

  return (
    <section
      className={cn(
        'mystic-pattern-band mystic-footer-grain relative overflow-hidden',
        variant === 'plum' &&
          'mt-16 rounded-[1.35rem] border border-line/50 bg-plum px-6 py-10 text-paper md:px-10 md:py-12',
        variant === 'shell' && 'border-t border-gold/15 text-paper',
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-[0.55]',
          resolvedPattern === 'rhombus' && 'mystic-pattern-nested-rhombus',
          resolvedPattern === 'braid' && 'mystic-pattern-braided-lines'
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gold/15 blur-3xl md:-right-8 md:h-72 md:w-72"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-paper/[0.07] via-transparent to-shell/25"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

/** Eyebrow tuned for plum / shell pattern bands */
export const mysticPatternBandEyebrow = 'type-eyebrow text-gold/90';
