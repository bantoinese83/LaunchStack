'use client';

import { useLayoutEffect, useRef } from 'react';
import type React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { annotate } from 'rough-notation';

type AnnotationAction =
  'highlight' | 'underline' | 'box' | 'circle' | 'strike-through' | 'crossed-off' | 'bracket';

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;
  className?: string;
}

export function Highlighter({
  children,
  action = 'highlight',
  color = '#ffd1dc',
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  className,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  const isInView = useInView(elementRef, {
    once: true,
    margin: '-10%',
  });

  const shouldShow = !isView || isInView;

  useLayoutEffect(() => {
    if (reduceMotion) return;

    const element = elementRef.current;
    let annotation: ReturnType<typeof annotate> | null = null;
    let resizeObserver: ResizeObserver | null = null;

    if (shouldShow && element) {
      const currentAnnotation = annotate(element, {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      });
      annotation = currentAnnotation;
      currentAnnotation.show();

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide();
        currentAnnotation.show();
      });

      resizeObserver.observe(element);
      resizeObserver.observe(document.body);
    }

    return () => {
      annotation?.remove();
      resizeObserver?.disconnect();
    };
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    reduceMotion,
  ]);

  return (
    <span ref={elementRef} className={className ?? 'relative inline-block bg-transparent'}>
      {children}
    </span>
  );
}
