'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { StylistHeroFigure } from '@/components/mystic/editorial/StylistHeroFigure';
import { MysticHeroBackground } from '@/components/mystic/editorial/MysticHeroBackground';
import { MysticHeroCornerMeta } from '@/components/mystic/editorial/MysticHeroCornerMeta';
import { cn } from '@/lib/utils';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';

type Props = {
  onAboutLuke: () => void;
};

const fade = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** 21st Hero-04–inspired editorial hero for Mystic. */
export function MysticEditorialHero({ onAboutLuke }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate w-full overflow-hidden bg-paper px-5 pb-20 pt-14 sm:py-20 sm:pb-24 lg:px-8 lg:pb-28 lg:pt-[5.5rem]">
      <MysticHeroBackground />
      <MysticHeroCornerMeta />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl"
        initial={reduce ? false : 'hidden'}
        whileInView={reduce ? undefined : 'visible'}
        viewport={{ once: true, margin: '-60px' }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={fade}
            className="relative flex flex-col items-start gap-5 pt-8 sm:pt-10 md:pt-12 lg:pt-14"
          >
            <p className="type-eyebrow text-plum">Mobile house calls · Chicago</p>
            <hr className="mystic-editorial-rule max-w-[12rem]" />
            <h1 className="type-display-hero text-ink">
              House-call hair
              <span className="type-hand-hero mt-1 block text-chalk">in Chicago.</span>
            </h1>
            <p className="type-lede max-w-md">
              Blowouts, cuts, updos, and dry styling at your door in Chicago and River North. Book
              online, share inspo photos, and Luke arrives with a full pro kit.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <MysticMagneticLink href="/book">Book a house call</MysticMagneticLink>
              <MysticMagneticLink href="#memberships" variant="secondary">
                Memberships
              </MysticMagneticLink>
              <MysticMagneticButton variant="secondary" onClick={onAboutLuke}>
                About Luke
              </MysticMagneticButton>
            </div>
            <dl className="mt-8 grid w-full max-w-md grid-cols-3 gap-4 border-t border-line/60 pt-8">
              {[
                { label: 'From', value: '$45' },
                { label: 'Travel', value: '5 mi' },
                { label: 'Book', value: 'Online' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="type-eyebrow text-muted">{label}</dt>
                  <dd className="type-stat mt-1.5 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div variants={fade} className={cn('relative w-full lg:justify-self-end')}>
            <StylistHeroFigure />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
