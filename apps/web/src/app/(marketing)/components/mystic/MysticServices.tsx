import Link from 'next/link';
import { MYSTIC_SERVICES, formatUsd, type ServiceId } from '@template/mystic';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import { MysticMarketingSectionHead } from '@/components/mystic/editorial/MysticMarketingSectionHead';
import { mysticBookHref } from '@/lib/mystic/book-links';

export function MysticServices() {
  return (
    <section id="services" className="px-5 pt-16 pb-10 md:px-8 md:pt-24 md:pb-12">
      <div className="mx-auto max-w-5xl">
        <MysticMarketingSectionHead
          handLabel="At your door"
          eyebrow="Services"
          title="House-call menu"
          description="Travel within our service area is included for the first five miles. Color is arranged by message — not online yet."
        />

        <ul className="mt-14">
          {MYSTIC_SERVICES.map((service, index) => (
            <li
              key={service.id}
              className={`mystic-menu-row group py-9 first:border-t md:py-10 ${
                index === MYSTIC_SERVICES.length - 1 ? 'border-b border-line/70' : ''
              }`}
            >
              <div className="grid gap-6 md:grid-cols-[12.5rem_1fr_auto] md:items-start md:gap-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start md:flex-col">
                  <span className="font-display text-3xl text-line/90 transition group-hover:text-gold/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <MysticServiceIllustration serviceId={service.id as ServiceId} size="lg" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-2xl text-ink md:text-[1.75rem]">
                      {service.name}
                    </h3>
                    <span className="type-eyebrow text-muted">
                      {service.durationMinutes} min · house call
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                    {service.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end md:items-end md:text-right">
                  <p className="font-display text-2xl text-ink md:text-[1.85rem]">
                    {formatUsd(service.priceCents)}
                  </p>
                  <MysticMagneticLink href={mysticBookHref(service.id)} size="sm">
                    Book now
                  </MysticMagneticLink>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12">
          <Link href="/book" className="type-eyebrow text-chalk transition hover:text-ink">
            See live availability →
          </Link>
        </p>
      </div>
    </section>
  );
}
