import Link from 'next/link';
import { MYSTIC_SERVICES, formatUsd, type ServiceId } from '@template/mystic';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import { mysticEyebrow, mysticSectionTitle } from './mystic-styles';

export function MysticServices() {
  return (
    <section id="services" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className={mysticEyebrow}>Services</p>
          <h2 className={`${mysticSectionTitle} mt-3`}>House-call menu</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Travel within our service area is included for the first five miles. Color is arranged
            by message — not online yet.
          </p>
        </div>

        <ul className="mt-14">
          {MYSTIC_SERVICES.map((service, index) => (
            <li
              key={service.id}
              className={`mystic-menu-row group py-9 first:border-t md:py-10 ${
                index === MYSTIC_SERVICES.length - 1 ? 'border-b border-line/70' : ''
              }`}
            >
              <div className="grid gap-6 md:grid-cols-[4.5rem_1fr_auto] md:items-start md:gap-10">
                <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                  <span className="font-display text-3xl text-line/90 transition group-hover:text-gold/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <MysticServiceIllustration serviceId={service.id as ServiceId} />
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
                <p className="font-display shrink-0 text-2xl text-ink md:text-right md:text-[1.85rem]">
                  {formatUsd(service.priceCents)}
                </p>
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
