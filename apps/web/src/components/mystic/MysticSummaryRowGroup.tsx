'use client';

import { mysticCard } from '@/components/mystic/mystic-styles';

export type SummaryRow = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  onEdit?: () => void;
};

/** Zocdoc-style grouped review rows — tap to jump back in the flow. */
export function MysticSummaryRowGroup({ rows }: { rows: SummaryRow[] }) {
  return (
    <ul className={`${mysticCard} divide-y divide-line/80 overflow-hidden p-0`}>
      {rows.map((row) => (
        <li key={row.id}>
          {row.onEdit ? (
            <button
              type="button"
              onClick={row.onEdit}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-paper/80"
            >
              <SummaryRowContent row={row} />
              <span className="shrink-0 text-muted" aria-hidden>
                ›
              </span>
            </button>
          ) : (
            <div className="px-4 py-3.5">
              <SummaryRowContent row={row} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SummaryRowContent({ row }: { row: SummaryRow }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{row.label}</p>
      <p className="text-sm font-medium text-ink">{row.value}</p>
      {row.hint ? <p className="mt-0.5 text-xs text-muted">{row.hint}</p> : null}
    </div>
  );
}
