'use client';

import { useLukeProfile } from '@/components/mystic/LukeProfileContext';
import { MysticEditorialHero } from '@/components/mystic/editorial/MysticEditorialHero';

const trustLines = [
  { kicker: 'House calls', line: 'Blowouts, cuts, and updos at your door.' },
  { kicker: 'Members', line: 'Glow & Luxe skip travel and evening surcharges on blowouts.' },
  {
    kicker: 'Chicago',
    line: 'House calls across our mapped service area — reach out if you’re just outside the zone.',
  },
];

export function MysticHero() {
  const { openLukeProfile } = useLukeProfile();

  return (
    <>
      <MysticEditorialHero onAboutLuke={openLukeProfile} />
      <div className="mystic-trust-rail">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line/50 md:px-8 md:py-11">
          {trustLines.map(({ kicker, line }) => (
            <div key={kicker} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="type-eyebrow text-gold">{kicker}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/90 md:text-[0.9375rem]">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
