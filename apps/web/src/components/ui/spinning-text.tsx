'use client';

import React, { type ComponentPropsWithoutRef } from 'react';
import { motion, useReducedMotion, type Transition, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinningTextProps extends ComponentPropsWithoutRef<'div'> {
  children: string | string[];
  duration?: number;
  reverse?: boolean;
  radius?: number;
  transition?: Transition;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

const BASE_TRANSITION: Transition = {
  repeat: Infinity,
  ease: 'linear',
};

const BASE_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
  },
};

export function SpinningText({
  children,
  duration = 10,
  reverse = false,
  radius = 5,
  transition,
  variants,
  className,
  style,
}: SpinningTextProps) {
  const reduceMotion = useReducedMotion();

  if (typeof children !== 'string' && !Array.isArray(children)) {
    throw new Error('children must be a string or an array of strings');
  }

  let text = children;
  if (Array.isArray(text)) {
    if (!text.every((child) => typeof child === 'string')) {
      throw new Error('all elements in children array must be strings');
    }
    text = text.join('');
  }

  const letters = text.split('');
  letters.push(' ');

  if (reduceMotion) {
    return (
      <div className={cn('relative', className)} style={style}>
        <span className="sr-only">{text}</span>
      </div>
    );
  }

  const finalTransition: Transition = {
    ...BASE_TRANSITION,
    ...transition,
    duration: (transition as { duration?: number })?.duration ?? duration,
  };

  const containerVariants: Variants = {
    visible: { rotate: reverse ? -360 : 360 },
    ...variants?.container,
  };

  const itemVariants: Variants = {
    ...BASE_ITEM_VARIANTS,
    ...variants?.item,
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={style}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={finalTransition}
    >
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden
          key={`${index}-${letter}`}
          variants={itemVariants}
          className="absolute top-1/2 left-1/2 inline-block"
          style={
            {
              '--index': index,
              '--total': letters.length,
              '--radius': radius,
              transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
              transformOrigin: 'center',
            } as React.CSSProperties
          }
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{text}</span>
    </motion.div>
  );
}
