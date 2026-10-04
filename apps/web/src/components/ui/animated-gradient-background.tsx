'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

export interface AnimatedGradientBackgroundProps {
  /** Initial radial gradient size (starting width). @default 125 */
  startingGap?: number;
  /** Breathing animation. @default false */
  Breathing?: boolean;
  /** Colors for each stop in `gradientStops`. */
  gradientColors?: string[];
  /** Stop percentages (0–100), same length as `gradientColors`. */
  gradientStops?: number[];
  /** Breathing speed; lower is slower. @default 0.02 */
  animationSpeed?: number;
  /** Breathing range in percentage points. @default 5 */
  breathingRange?: number;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  /** Extra vertical stretch on the radial ellipse. @default 0 */
  topOffset?: number;
}

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = ['#0A0A0A', '#2979FF', '#FF80AB', '#FF6D00', '#FFD600', '#00E676', '#3D5AFE'],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = '',
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `gradientColors and gradientStops must have the same length (got ${gradientColors.length} and ${gradientStops.length}).`
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;
    const breathing = Breathing && !reduceMotion;

    const animateGradient = () => {
      if (breathing) {
        if (width >= startingGap + breathingRange) directionWidth = -1;
        if (width <= startingGap - breathingRange) directionWidth = 1;
      } else {
        directionWidth = 0;
      }
      width += directionWidth * animationSpeed;

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(', ');

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    startingGap,
    Breathing,
    gradientColors,
    gradientStops,
    animationSpeed,
    breathingRange,
    topOffset,
    reduceMotion,
  ]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={reduceMotion ? false : { opacity: 0, scale: 1.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${containerClassName}`.trim()}
      aria-hidden
    >
      <div ref={containerRef} style={containerStyle} className="absolute inset-0" />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
