import Link from 'next/link';

export function MysticHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-gold-soft blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="type-eyebrow text-accent">Mobile house calls</p>
        <h1 className="font-display mt-4 text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
          Luxury hair, delivered to you.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Blowouts, cuts, updos, and dry styles at your home — mid-century calm, boho ease. Book in
          a few taps. Members skip travel and evening fees.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/book"
            className="w-full rounded-full bg-shell px-8 py-3.5 text-center text-sm font-medium text-paper sm:w-auto"
          >
            Book an appointment
          </Link>
          <Link
            href="#memberships"
            className="w-full rounded-full border border-line bg-surface px-8 py-3.5 text-center text-sm font-medium text-ink sm:w-auto"
          >
            View memberships
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          Shareable link for Instagram ·{' '}
          <a
            href="https://instagram.com/mystichair21"
            className="font-medium text-chalk underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            @mystichair21
          </a>
        </p>
      </div>
    </section>
  );
}
