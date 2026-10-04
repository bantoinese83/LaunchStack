import React from 'react';
import type { LaunchStackTechEntry } from '../lib/launchStackTech';
import { TechStackIcon } from './TechStackIcon';

export function TechStackToken({
  entry,
  active,
  onFocus,
}: {
  entry: LaunchStackTechEntry;
  active: boolean;
  onFocus: () => void;
}) {
  return (
    <button
      type="button"
      className={`tech-token ${active ? 'tech-token--active' : ''}`.trim()}
      aria-label={entry.name}
      aria-pressed={active}
      onMouseEnter={onFocus}
      onFocus={onFocus}
    >
      <span className="tech-token__ring" aria-hidden />
      <span className="tech-token__glass">
        <TechStackIcon entry={entry} />
      </span>
    </button>
  );
}
