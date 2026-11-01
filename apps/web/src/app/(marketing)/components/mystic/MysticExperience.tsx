'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLukeProfile } from '@/components/mystic/LukeProfileContext';
import { MysticMarketingPhoto } from '@/components/mystic/MysticMarketingPhoto';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticFeatureBento } from '@/components/mystic/MysticFeatureBento';
import { MysticMarketingSectionHead } from '@/components/mystic/editorial/MysticMarketingSectionHead';
import { MysticProcessStack } from '@/components/mystic/editorial/MysticProcessStack';

const MysticExperienceWaveCanvas = dynamic(
  () =>
    import('@/components/mystic/editorial/MysticExperienceWaveCanvas').then(
      (m) => m.MysticExperienceWaveCanvas
    ),
  { ssr: false }
);

export function MysticExperience() {
  const { openLukeProfile } = useLukeProfile();
  const sectionRef = useRef<HTMLElement>(null);
  const [mountWaves, setMountWaves] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setMountWaves(true);
      },
      { rootMargin: '240px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mystic-marketing-section mystic-marketing-section--defer relative isolate overflow-hidden bg-shell px-5 py-16 text-paper md:px-8 md:py-24"
    >
      {mountWaves ? <MysticExperienceWaveCanvas /> : null}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(196, 169, 98, 0.28), transparent 55%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <button
          type="button"
          onClick={openLukeProfile}
          className="group order-2 text-left lg:order-1"
        >
          <div className="mystic-portrait-frame max-w-md lg:max-w-none">
            <div className="mystic-portrait-inner bg-[#a3b5a0]">
              <MysticMarketingPhoto
                src={MYSTIC_MARKETING_IMAGES.stylistHeroScenes[1]!}
                alt="Luke — Mystic Hair Co. house-call stylist"
                crop="fit"
                sizes="(max-width:1024px) 100vw, 420px"
                className="aspect-[3/4] w-full transition duration-700 group-hover:scale-[1.01]"
              />
            </div>
          </div>
          <p className="type-eyebrow mt-5 text-gold">Tap for Luke&apos;s bio</p>
          <p className="type-display-md mt-1 text-paper">Verified house-call stylist</p>
        </button>

        <div className="order-1 lg:order-2">
          <MysticMarketingSectionHead
            handLabel="Simple path"
            eyebrow="How it works"
            title="Book online. Luke comes to you."
            description="Pick a service, choose a time, and confirm in one clear summary. Luke arrives with a full kit, inspo photos are welcome, and booking is built for busy Chicago schedules."
            inverse
          />
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
      <MysticProcessStack />
      <div className="relative z-10 mx-auto mt-10 max-w-6xl md:mt-12">
        <MysticFeatureBento />
      </div>
    </section>
  );
}
