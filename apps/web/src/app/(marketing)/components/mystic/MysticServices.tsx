import { MYSTIC_SERVICES, formatUsd } from '@template/mystic';

export function MysticServices() {
  return (
    <section id="services" className="border-t border-line bg-surface px-5 py-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="type-eyebrow text-accent">Services</p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink">
          House-call menu
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Every appointment includes travel within our service area. Color services are not booked
          online yet — message Luke for special requests.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {MYSTIC_SERVICES.map((service) => (
            <li
              key={service.id}
              className="rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl text-ink">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                </div>
                <p className="shrink-0 font-medium text-ink">{formatUsd(service.priceCents)}</p>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-chalk">
                {service.durationMinutes} min · house call
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
