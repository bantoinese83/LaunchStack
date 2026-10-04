import React from 'react';
import { cn } from '../utils';
import { LAUNCHSTACK_MARK_VIEWBOX, launchstackMarkPaths } from './launchstackMarkPaths';

export type LaunchStackMarkTone = 'inherit' | 'shell' | 'paper' | 'accent' | 'muted';

const toneClassName: Record<LaunchStackMarkTone, string> = {
  inherit: 'text-current',
  shell: 'text-shell',
  paper: 'text-paper',
  accent: 'text-accent',
  muted: 'text-muted',
};

export type LaunchStackMarkGraphicProps = {
  className?: string;
  /** Pixel width/height (square). */
  size?: number;
  tone?: LaunchStackMarkTone;
  /** Subtle staggered twinkle on globe dots. */
  animated?: boolean;
  title?: string;
};

export const LaunchStackMarkGraphic: React.FC<LaunchStackMarkGraphicProps> = ({
  className,
  size = 32,
  tone = 'inherit',
  animated = false,
  title = 'LaunchStack',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={LAUNCHSTACK_MARK_VIEWBOX}
    width={size}
    height={size}
    role="img"
    aria-label={title}
    className={cn(
      'launchstack-mark shrink-0',
      toneClassName[tone],
      animated && 'launchstack-mark--animated',
      className
    )}
  >
    <g fill="currentColor">
      {launchstackMarkPaths.map((d, index) => (
        <path
          key={index}
          d={d}
          className="launchstack-mark__dot"
          style={
            animated
              ? ({
                  ['--mark-dot-i' as string]: index,
                } as React.CSSProperties)
              : undefined
          }
        />
      ))}
    </g>
  </svg>
);
