'use client';

import { motion, useReducedMotion } from 'framer-motion';

const STEPS = [
  { n: '01', label: 'Service' },
  { n: '02', label: 'Time & place' },
  { n: '03', label: 'Checkout' },
] as const;

/** Large process lines with hand numerals — pairs with the feature bento. */
export function MysticProcessStack() {
  const reduce = useReducedMotion();

  return (
    <div className="relative z-10 mx-auto mt-14 max-w-6xl md:mt-16">
      <p className="type-hand-lg text-center text-gold">What to expect</p>
      <motion.ol
        className="mt-6 flex flex-col items-center gap-1 pl-8 md:gap-2 md:pl-10"
        initial={reduce ? false : 'hidden'}
        whileInView={reduce ? undefined : 'visible'}
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {STEPS.map(({ n, label }) => (
          <motion.li
            key={n}
            className="relative inline-flex items-start uppercase"
            variants={{
              hidden: { opacity: 0, x: -28 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <span className="type-hand-lg absolute -left-7 top-0 text-gold md:-left-8">{n}</span>
            <span className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[0.96] tracking-[-0.03em] text-paper">
              {label}
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
