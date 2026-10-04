'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_PHONE_SCREENS } from './heroPhones';
import { Phone3D } from './Phone3D';

type Slot = 'front' | 'left' | 'right' | 'hidden';

const HERO_ROTATE_MS = 5200;

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function slotFor(screenIndex: number, active: number, count: number): Slot {
  if (count <= 1) return screenIndex === active ? 'front' : 'hidden';
  const delta = wrapIndex(screenIndex - active, count);
  if (delta === 0) return 'front';
  if (delta === 1) return 'right';
  if (delta === count - 1) return 'left';
  return 'hidden';
}

export function PhoneMockups() {
  const screens = HERO_PHONE_SCREENS;
  const count = screens.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => wrapIndex(current + 1, count));
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, paused, reduceMotion]);

  if (count === 0) return null;

  const active = screens[index] ?? screens[0];
  if (!active) return null;

  const step = (dir: 1 | -1) => setIndex((current) => wrapIndex(current + dir, count));

  return (
    <div
      className="phone-stage"
      aria-label="LaunchStack on iOS and Android"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="phone-stage__float">
        <div className="phone-stage__cluster">
          <span className="phone-stage__shadow" aria-hidden="true" />
          {screens.map((screen, screenIndex) => {
            const slot = slotFor(screenIndex, index, count);
            return (
              <Phone3D
                key={screen.id}
                screen={screen}
                slot={slot}
                hidden={slot !== 'front'}
                onClick={
                  slot === 'left' ? () => step(-1) : slot === 'right' ? () => step(1) : undefined
                }
              />
            );
          })}
        </div>
      </div>

      <div className="phone-stage__controls">
        <button
          type="button"
          className="phone-stage__nav"
          aria-label="Previous screen"
          onClick={() => step(-1)}
        >
          <ChevronLeft size={16} className="phone-stage__nav-icon" aria-hidden="true" />
          <span className="phone-stage__nav-label" aria-hidden="true">
            Prev
          </span>
        </button>
        <p
          key={active.id}
          className="phone-stage__index font-mono text-[10px] uppercase tracking-[0.16em]"
          aria-live="polite"
        >
          {active.label}
        </p>
        <button
          type="button"
          className="phone-stage__nav"
          aria-label="Next screen"
          onClick={() => step(1)}
        >
          <ChevronRight size={16} className="phone-stage__nav-icon" aria-hidden="true" />
          <span className="phone-stage__nav-label" aria-hidden="true">
            Next
          </span>
        </button>
      </div>
    </div>
  );
}
