import { CalendarDays, MapPin, Sparkles } from 'lucide-react';

const items = [
  {
    icon: Sparkles,
    title: 'House calls',
    body: 'Blowouts, cuts, and updos at your door.',
  },
  {
    icon: CalendarDays,
    title: 'Members skip the extras',
    body: 'Glow & Luxe waive travel and evening surcharges on blowouts.',
  },
  {
    icon: MapPin,
    title: 'Chicago & River North',
    body: 'Mobile service across our mapped area — message Luke for edge cases.',
  },
];

export function MysticTrustStrip() {
  return (
    <section className="border-y border-line/60 bg-surface/60 px-5 py-10 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-6">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-chalk ring-1 ring-gold/25">
              <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </div>
            <div>
              <p className="font-medium text-ink">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
