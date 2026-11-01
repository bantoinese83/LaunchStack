'use client';

export type SummaryRow = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  onEdit?: () => void;
};

/** Soft stacked review rows — tap to jump back in the flow (no divider rules). */
export function MysticSummaryRowGroup({ rows }: { rows: SummaryRow[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.id}>
          {row.onEdit ? (
            <button
              type="button"
              onClick={row.onEdit}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left transition hover:bg-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <SummaryRowContent row={row} />
              <span className="shrink-0 text-sm text-muted" aria-hidden>
                Edit
              </span>
            </button>
          ) : (
            <div className="rounded-2xl bg-surface px-4 py-3.5">
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
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{row.label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{row.value}</p>
      {row.hint ? <p className="mt-0.5 text-xs text-muted">{row.hint}</p> : null}
    </div>
  );
}
