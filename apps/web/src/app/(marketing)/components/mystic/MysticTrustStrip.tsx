import type { MysticIconRole } from '@template/mystic';
import { MysticIcon, mysticIconTileClassName } from '@/components/mystic/icons/MysticIcon';

const items: { icon: MysticIconRole; title: string; body: string }[] = [
  {
    icon: 'houseCall',
    title: 'House calls',
    body: 'Blowouts, cuts, and updos at your door — Luke rolls up with a full pro kit.',
  },
  {
    icon: 'membershipPerk',
    title: 'Members skip the extras',
    body: 'Glow & Luxe waive travel and evening surcharges on blowouts.',
  },
  {
    icon: 'serviceArea',
    title: 'Chicago & River North',
    body: 'Mobile service across our mapped area — message Luke for edge cases.',
  },
];

export function MysticTrustStrip() {
  return (
    <section className="border-y border-line/60 bg-surface/60 px-5 py-10 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-6">
        {items.map(({ icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${mysticIconTileClassName()}`}
            >
              <MysticIcon name={icon} className="h-5 w-5" />
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
