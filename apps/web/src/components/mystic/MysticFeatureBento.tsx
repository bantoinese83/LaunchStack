import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Hairline bento grid — 21st Feature Overview Bento pattern, Mystic copy. */
export function MysticFeatureBento({ className }: Props) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-2xl border border-line/60 bg-line/60 md:grid-cols-3 md:grid-rows-2',
        className
      )}
    >
      <figure className="bg-surface p-6 md:col-span-2 md:row-span-2 md:p-8">
        <blockquote className="type-pull text-ink">
          “Four steps to book — service, time, address, and checkout.”
        </blockquote>
        <figcaption className="type-eyebrow mt-4 text-muted">
          Mystic Hair Co. · house calls
        </figcaption>
      </figure>
      <div className="bg-paper p-5 md:p-6">
        <p className="type-eyebrow text-gold">Step 1–4</p>
        <p className="mt-2 font-display text-2xl text-ink">Simple booking</p>
        <p className="mt-2 text-sm text-muted">Service → time → address → pay.</p>
      </div>
      <div className="bg-paper p-5 md:p-6">
        <p className="type-eyebrow text-gold">Members</p>
        <p className="mt-2 font-display text-2xl text-ink">No surcharges</p>
        <p className="mt-2 text-sm text-muted">Travel & evening fees waived on blowouts.</p>
      </div>
    </div>
  );
}
