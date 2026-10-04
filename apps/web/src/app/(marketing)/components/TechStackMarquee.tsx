'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { usePointerLight } from '@/hooks/usePointerLight';
import { LAUNCHSTACK_HERO_GRADIENT } from '../lib/stackGradient';
import { LAUNCHSTACK_TECH_ENTRIES, type LaunchStackTechEntry } from '../lib/launchStackTech';
import { TechStackToken } from './TechStackToken';

const STEP_MS = 2600;

function TechBelt({
  entries,
  activeIndex,
  onSelect,
}: {
  entries: LaunchStackTechEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const loop = [...entries, ...entries];

  return (
    <div className="tech-stack-belt">
      <div className="tech-stack-belt__floor" aria-hidden />
      <div className="tech-stack-belt__inner">
        <div className="tech-marquee tech-marquee--spotlight">
          <ul
            className="tech-marquee__track tech-marquee__track--left"
            style={{ ['--marquee-duration' as string]: '52s' }}
          >
            {loop.map((entry, index) => {
              const sourceIndex = index % entries.length;
              return (
                <li key={`${entry.name}-${index}`} className="tech-marquee__item">
                  <TechStackToken
                    entry={entry}
                    active={sourceIndex === activeIndex % entries.length}
                    onFocus={() => onSelect(sourceIndex)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function TechStackMarquee() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  usePointerLight(stageRef, { ease: 0.08, rest: { x: 0.5, y: 0.4 } });

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % LAUNCHSTACK_TECH_ENTRIES.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const active = LAUNCHSTACK_TECH_ENTRIES[activeIndex] ?? LAUNCHSTACK_TECH_ENTRIES[0];
  const total = LAUNCHSTACK_TECH_ENTRIES.length;

  return (
    <section
      id="stack"
      className="tech-stack-section border-y border-line bg-paper py-16 md:py-20"
      aria-label="LaunchStack technology stack"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={stageRef}
          className="tech-stack-stage relative overflow-hidden rounded-[1.35rem] bg-shell px-6 py-10 text-paper md:px-10 md:py-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <AnimatedGradientBackground
            Breathing
            startingGap={120}
            breathingRange={8}
            animationSpeed={0.013}
            topOffset={24}
            gradientColors={[...LAUNCHSTACK_HERO_GRADIENT.gradientColors]}
            gradientStops={[...LAUNCHSTACK_HERO_GRADIENT.gradientStops]}
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-b from-shell/30 via-transparent to-shell/85"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 tech-stack-grid opacity-40"
            aria-hidden
          />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <p className="type-eyebrow text-accent">Built with</p>
              <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/45">
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </p>
              <div className="mt-2 min-h-[3.25rem] md:min-h-[3.75rem]">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={active?.name}
                    className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] tracking-tight text-paper"
                    initial={reduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {active?.name}
                  </motion.h2>
                </AnimatePresence>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/55 md:text-base">
                {total} production tools wired through one Turborepo graph — web, admin, and mobile
                share the same contracts.
              </p>
            </div>

            <div className="tech-stack-rail hidden shrink-0 md:block" aria-hidden>
              <span
                className="tech-stack-rail__fill"
                style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-10">
            <TechBelt
              entries={LAUNCHSTACK_TECH_ENTRIES}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          </div>

          <h3 className="sr-only">
            Full stack: {LAUNCHSTACK_TECH_ENTRIES.map((entry) => entry.name).join(', ')}
          </h3>
        </div>
      </div>
    </section>
  );
}
