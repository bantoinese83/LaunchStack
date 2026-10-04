import React from 'react';
import type { SimpleIcon } from 'simple-icons';
import type { LaunchStackTechEntry } from '../lib/launchStackTech';

function SimpleIconMark({ icon, fill }: { icon: SimpleIcon; fill?: string }) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="tech-marquee__logo-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} fill={fill ?? `#${icon.hex}`} />
    </svg>
  );
}

export function TechStackIcon({
  entry,
  className = '',
}: {
  entry: LaunchStackTechEntry;
  className?: string;
}) {
  if (entry.logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small static brand marks (same as Monarch site)
      <img
        src={entry.logoSrc}
        alt=""
        className={`tech-marquee__logo-img ${className}`.trim()}
        loading="lazy"
        decoding="async"
        draggable={false}
        data-brand={entry.name}
      />
    );
  }

  if (entry.icon) {
    return (
      <span className={`tech-marquee__logo-mark ${className}`.trim()} title={entry.logoAlt}>
        <SimpleIconMark icon={entry.icon} fill={entry.fill} />
      </span>
    );
  }

  return null;
}
