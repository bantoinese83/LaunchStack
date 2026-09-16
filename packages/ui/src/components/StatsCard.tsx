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
  <Card className="relative overflow-hidden transition-colors hover:border-ink/20">
    <div className="absolute left-0 top-0 h-full w-[3px] bg-accent" aria-hidden />
    <p className="pl-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
    <div className="mt-2 flex items-baseline justify-between gap-3 pl-2">
      <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">{value}</h3>
      {change && (
        <span
          className={cn(
            'shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold',
            isPositive
              ? 'border-accent/20 bg-accent-soft text-accent'
              : 'border-red-200 bg-red-50 text-danger'
          )}
        >
          {change}
        </span>
      )}
    </div>
    {subtext && <p className="mt-2 pl-2 text-xs leading-relaxed text-muted">{subtext}</p>}
  </Card>
);
