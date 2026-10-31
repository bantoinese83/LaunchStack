'use client';

import { useLukeProfile } from '@/components/mystic/LukeProfileContext';
import { MysticMarketingImage } from '@/components/mystic/MysticMarketingImage';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticFeatureBento } from '@/components/mystic/MysticFeatureBento';

export function MysticExperience() {
  const { openLukeProfile } = useLukeProfile();

  return (
    <section className="relative overflow-hidden bg-shell px-5 py-16 text-paper md:px-8 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(196, 169, 98, 0.25), transparent 55%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <button
          type="button"
          onClick={openLukeProfile}
          className="group order-2 text-left lg:order-1"
        >
          <div className="mystic-portrait-frame max-w-md lg:max-w-none">
            <div className="mystic-portrait-inner">
              <MysticMarketingImage
                variant="stylist"
                alt="Luke — Mystic Hair Co. house-call stylist"
                width={640}
                height={720}
                className="aspect-[5/6] w-full object-cover transition duration-700 group-hover:scale-[1.015]"
                sizes="(max-width:1024px) 100vw, 420px"
              />
            </div>
          </div>
          <p className="type-eyebrow mt-5 text-gold">Tap for Luke&apos;s bio</p>
          <p className="type-display-md mt-1 text-paper">Verified house-call stylist</p>
        </button>

        <div className="order-1 lg:order-2">
          <p className="type-eyebrow text-gold">How it works</p>
          <hr className="mystic-editorial-rule mt-5 max-w-[10rem] opacity-80" />
          <h2 className="type-display-lg mt-8 text-paper">Book online. Luke comes to you.</h2>
          <p className="type-lede type-lede-inverse mt-6 max-w-lg">
            Pick a service, choose a time, and confirm in one clear summary. Luke arrives with a
            full kit, inspo photos are welcome, and booking is built for busy Chicago schedules.
          </p>
          <ul className="mt-8 space-y-3 border-l border-gold/35 pl-5 text-sm text-paper/85 md:text-base">
            {[
              'Simple online booking in four steps',
              'Door-timer & on-the-way texts when you’re confirmed',
              'Membership credits applied automatically at checkout',
            ].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MysticMagneticLink href="/book">Reserve a house call</MysticMagneticLink>
            <MysticMagneticButton
              variant="secondary"
              surface="dark"
              onClick={() => openLukeProfile()}
            >
              About Luke
            </MysticMagneticButton>
            <MysticMagneticLink href="/studio" variant="secondary" surface="dark">
              Luke&apos;s Studio
            </MysticMagneticLink>
          </div>
        </div>
      </div>
      <div className="relative mx-auto mt-16 max-w-6xl">
        <MysticFeatureBento />
      </div>
    </section>
  );
}
