'use client';

import { formatUsd, type MysticService } from '@template/mystic';
import { cn } from '@/lib/utils';
import { MysticCardFlip } from '@/components/mystic/MysticCardFlip';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';

type Props = {
  service: MysticService;
  selected: boolean;
  onSelect: () => void;
};

export function MysticBookServiceFlipCard({ service, selected, onSelect }: Props) {
  const face = cn(
    'border-line/70 bg-surface',
    selected && 'border-gold/45 bg-gold-soft/90 shadow-[0_10px_28px_-18px_rgba(196,169,98,0.55)]'
  );

  return (
    <MysticCardFlip
      axis="y"
      className="aspect-[5/4] w-full sm:aspect-[4/3]"
      selectOnFrontPress
      onFrontPress={onSelect}
      onFlippedChange={() => onSelect()}
      label={`${service.name}, ${formatUsd(service.priceCents)}, ${service.durationMinutes} minutes${selected ? ', selected' : ''}`}
      faceClassName={face}
      front={
        <div className="flex h-full flex-col p-4 text-left">
          <div className="flex w-full items-start justify-between gap-2">
            <MysticServiceIllustration serviceId={service.id} size="sm" />
            <span className="rounded-full bg-paper/80 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted">
              {service.durationMinutes}m
            </span>
          </div>
          {selected ? (
            <span className="type-eyebrow mt-2 w-fit rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">
              Selected
            </span>
          ) : null}
          <div className="mt-auto min-w-0 w-full pt-3">
            <p className="font-medium text-ink">{service.name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {service.description}
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">{formatUsd(service.priceCents)}</p>
          </div>
          <p className="type-eyebrow mt-3 text-[10px] text-muted/90">
            Tap to select · drag to flip
          </p>
        </div>
      }
      back={
        <div className="flex h-full flex-col p-4 text-left">
          <p className="type-hand-sm text-plum">{service.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/90">{service.description}</p>
          <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-line/60 pt-4 text-sm">
            <div>
              <dt className="type-eyebrow text-[10px] text-muted">At your door</dt>
              <dd className="font-medium text-ink">House call</dd>
            </div>
            <div>
              <dt className="type-eyebrow text-[10px] text-muted">Time</dt>
              <dd className="font-medium tabular-nums text-ink">{service.durationMinutes} min</dd>
            </div>
            <div className="col-span-2">
              <dt className="type-eyebrow text-[10px] text-muted">Starting at</dt>
              <dd className="font-display text-2xl text-ink">{formatUsd(service.priceCents)}</dd>
            </div>
          </dl>
          {selected ? (
            <p className="type-eyebrow mt-3 text-center text-accent">Selected for this visit</p>
          ) : (
            <p className="type-eyebrow mt-3 text-center text-muted">Selected when you flip here</p>
          )}
        </div>
      }
    />
  );
}
