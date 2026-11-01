'use client';

import { useState } from 'react';
import { HOUSE_CALL_POLICIES } from '@template/mystic';

/** Collapsible house-call prep — shown on visits, not only at checkout. */
export function MysticVisitPrep({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl bg-paper/80 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink">Before Luke arrives</span>
        <span className="text-xs font-medium text-plum">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <ul className="space-y-3 border-t border-line/60 px-3 pb-3 pt-2">
          {HOUSE_CALL_POLICIES.map((policy) => (
            <li key={policy.id}>
              <p className="text-sm font-medium text-ink">{policy.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{policy.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
