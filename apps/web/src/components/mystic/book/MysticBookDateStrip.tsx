'use client';

import { cn } from '@/lib/utils';

type Props = {
  /** ISO date yyyy-mm-dd */
  value: string;
  onChange: (isoDate: string) => void;
  days?: number;
};

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Week strip date picker — 21st booking calendar pattern (simplified). */
export function MysticBookDateStrip({ value, onChange, days = 14 }: Props) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const slots = Array.from({ length: days }, (_, i) => addDays(start, i));

  return (
    <div className="overflow-x-auto pb-1" role="group" aria-label="Choose appointment date">
      <div className="flex min-w-min gap-2">
        {slots.map((d) => {
          const iso = toIso(d);
          const active = value === iso;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const label = d.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });
          return (
            <button
              key={iso}
              type="button"
              disabled={isWeekend}
              aria-pressed={active}
              aria-disabled={isWeekend}
              aria-label={isWeekend ? `${label} (unavailable)` : label}
              onClick={() => onChange(iso)}
              className={cn(
                'flex w-[4.25rem] shrink-0 flex-col items-center rounded-2xl px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2',
                active
                  ? 'bg-shell text-paper shadow-[0_10px_24px_-14px_rgba(26,31,24,0.65)]'
                  : 'bg-surface text-ink hover:bg-accent-soft/60',
                isWeekend && 'cursor-not-allowed opacity-40'
              )}
            >
              <span className="type-eyebrow text-[0.65rem]">
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span className="font-display mt-1 text-lg leading-none">{d.getDate()}</span>
              <span className="mt-1 text-[0.65rem] text-muted">
                {d.toLocaleDateString(undefined, { month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
