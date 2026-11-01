'use client';

import { MYSTIC_MARKETING_BIG_TICKER } from '@/components/mystic/editorial/mystic-marketing-keywords';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Display-type word marquee — no solid color blocks. */
export function MysticBigTicker({ className }: Props) {
  const sequence = [...MYSTIC_MARKETING_BIG_TICKER, ...MYSTIC_MARKETING_BIG_TICKER];

  return (
    <div
      className={cn('overflow-x-hidden border-y border-line/70 py-5 md:py-6', className)}
      aria-hidden
    >
      <div className="mystic-big-ticker-marquee overflow-hidden">
        <div className="mystic-big-ticker-marquee__track flex items-center gap-10 whitespace-nowrap md:gap-12">
          {sequence.map((item, i) => {
            if (item.kind === 'sep') {
              return <span key={`sep-${i}`} className="h-px w-16 shrink-0 bg-line md:w-20" />;
            }
            return (
              <span
                key={`word-${item.text}-${i}`}
                className="font-display shrink-0 text-[clamp(2rem,5vw,3.5rem)] font-medium uppercase leading-[0.96] tracking-[-0.04em] text-ink"
              >
                {item.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
