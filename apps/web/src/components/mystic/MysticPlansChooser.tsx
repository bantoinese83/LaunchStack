import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  MYSTIC_PLANS_CHOOSER,
  MYSTIC_PLANS_SECTION_IDS,
  formatUsd,
} from '@template/mystic';
import { cn } from '@/lib/utils';

type ChooserCardProps = {
  href: `#${string}`;
  kicker: string;
  title: string;
  hint: string;
  cta: string;
  priceNote: string;
  accent: 'gold' | 'plum';
};

function PlansChooserCard({ href, kicker, title, hint, cta, priceNote, accent }: ChooserCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-h-[12.5rem] flex-col overflow-hidden rounded-2xl border border-line/60 bg-surface p-6 md:min-h-[13rem] md:p-7',
        'shadow-[0_22px_55px_-38px_rgba(26,31,24,0.42)] transition duration-300',
        'hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_30px_64px_-34px_rgba(26,31,24,0.36)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-pattern-surface-card opacity-[0.42] transition duration-300 group-hover:opacity-[0.58]"
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full blur-3xl transition duration-300 group-hover:opacity-100',
          accent === 'gold' ? 'bg-gold/25 opacity-80' : 'bg-plum/18 opacity-70'
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <p className="type-eyebrow text-plum">{kicker}</p>
        <h3 className="font-display mt-2 text-[1.65rem] leading-tight text-ink md:text-[1.85rem]">
          {title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted md:text-[0.9375rem]">{hint}</p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-line/55 pt-5">
          <p className="font-display text-xl text-ink">{priceNote}</p>
          <span className="type-eyebrow inline-flex items-center gap-2 text-accent transition-[gap] duration-300 group-hover:gap-3">
            {cta}
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

const membershipFrom = formatUsd(MYSTIC_MEMBERSHIPS[0]!.priceCentsMonthly);
const packageFrom = formatUsd(MYSTIC_PACKAGES[0]!.priceCents);

/** Quick fork: monthly vs prepaid — links jump to catalog sections. */
export function MysticPlansChooser() {
  return (
    <section className="mt-10" aria-labelledby="plans-chooser-heading">
      <header className="mb-6 max-w-lg">
        <h2 id="plans-chooser-heading" className="type-eyebrow text-muted">
          {MYSTIC_PLANS_CHOOSER.title}
        </h2>
        <hr className="mystic-editorial-rule mt-3 max-w-[5.5rem]" />
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <PlansChooserCard
          href={`#${MYSTIC_PLANS_SECTION_IDS.memberships}`}
          kicker={MYSTIC_PLANS_CHOOSER.membership.kicker}
          title={MYSTIC_PLANS_CHOOSER.membership.title}
          hint={MYSTIC_PLANS_CHOOSER.membership.hint}
          cta={MYSTIC_PLANS_CHOOSER.membership.cta}
          priceNote={`From ${membershipFrom}/mo`}
          accent="gold"
        />
        <PlansChooserCard
          href={`#${MYSTIC_PLANS_SECTION_IDS.packages}`}
          kicker={MYSTIC_PLANS_CHOOSER.package.kicker}
          title={MYSTIC_PLANS_CHOOSER.package.title}
          hint={MYSTIC_PLANS_CHOOSER.package.hint}
          cta={MYSTIC_PLANS_CHOOSER.package.cta}
          priceNote={`From ${packageFrom}`}
          accent="plum"
        />
      </div>
    </section>
  );
}
