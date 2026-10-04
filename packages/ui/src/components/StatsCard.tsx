import React from 'react';
import { Card } from './Card';
import { cn } from '../utils';

export interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtext,
}) => (
  <Card className="relative overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/25">
    <div
      className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent to-chalk"
      aria-hidden
    />
    <p className="pl-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
      {title}
    </p>
    <div className="mt-3 flex items-baseline justify-between gap-3 pl-3">
      <h3 className="font-display text-3xl font-medium tracking-tight text-ink">{value}</h3>
      {change && (
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            isPositive
              ? 'border-accent/25 bg-accent-soft text-accent'
              : 'border-red-200 bg-red-50 text-danger'
          )}
        >
          {change}
        </span>
      )}
    </div>
    {subtext && <p className="mt-2 pl-3 text-xs leading-relaxed text-muted">{subtext}</p>}
  </Card>
);
