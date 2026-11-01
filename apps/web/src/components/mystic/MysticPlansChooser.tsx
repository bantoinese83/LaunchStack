import Link from 'next/link';
import { MYSTIC_PLANS_CHOOSER, MYSTIC_PLANS_SECTION_IDS } from '@template/mystic';

/** Quick fork: monthly vs prepaid — links jump to catalog sections. */
export function MysticPlansChooser() {
  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-labelledby="plans-chooser-heading">
      <h2 id="plans-chooser-heading" className="sr-only">
        {MYSTIC_PLANS_CHOOSER.title}
      </h2>
      <Link
        href={`#${MYSTIC_PLANS_SECTION_IDS.memberships}`}
        className="rounded-2xl border border-line/70 bg-surface p-5 transition hover:border-accent/40 hover:bg-accent-soft/30"
      >
        <p className="type-eyebrow text-plum">{MYSTIC_PLANS_CHOOSER.membership.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {MYSTIC_PLANS_CHOOSER.membership.hint}
        </p>
        <p className="type-eyebrow mt-4 text-accent">{MYSTIC_PLANS_CHOOSER.membership.cta} →</p>
      </Link>
      <Link
        href={`#${MYSTIC_PLANS_SECTION_IDS.packages}`}
        className="rounded-2xl border border-line/70 bg-surface p-5 transition hover:border-accent/40 hover:bg-accent-soft/30"
      >
        <p className="type-eyebrow text-plum">{MYSTIC_PLANS_CHOOSER.package.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {MYSTIC_PLANS_CHOOSER.package.hint}
        </p>
        <p className="type-eyebrow mt-4 text-accent">{MYSTIC_PLANS_CHOOSER.package.cta} →</p>
      </Link>
    </section>
  );
}
