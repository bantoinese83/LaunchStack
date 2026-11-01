'use client';

import { MYSTIC_MARKETING_TICKER_KEYWORDS } from '@/components/mystic/editorial/mystic-marketing-keywords';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Thin uppercase keyword rail (ROSSI-style) — CSS marquee, pauses when reduced motion. */
export function MysticKeywordTicker({ className }: Props) {
  const items = [...MYSTIC_MARKETING_TICKER_KEYWORDS, ...MYSTIC_MARKETING_TICKER_KEYWORDS];

  return (
    <div className={cn('border-y border-line/70 bg-surface/40 py-3', className)} aria-hidden>
      <div className="mystic-keyword-marquee overflow-hidden">
        <div className="mystic-keyword-marquee__track flex gap-12 whitespace-nowrap">
          {items.map((label, i) => (
            <div key={`${label}-${i}`} className="flex shrink-0 items-center gap-12">
              <span className="type-eyebrow text-ink/85">{label}</span>
              <span className="h-px w-14 bg-line/90" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
