import React from 'react';
import { Search } from 'lucide-react';
import { FEEDBACK_CATEGORIES } from '@template/types';

export const FEEDBACK_FILTERS = ['all', ...FEEDBACK_CATEGORIES] as const;
export type FeedbackFilter = (typeof FEEDBACK_FILTERS)[number];

interface FeedbackFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: FeedbackFilter;
  setFilterCategory: (val: FeedbackFilter) => void;
}

export function FeedbackFilters({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
}: FeedbackFiltersProps) {
  return (
    <div className="mb-6 flex flex-col items-stretch justify-between gap-4 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
        <input
          type="search"
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/65 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {FEEDBACK_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filterCategory === cat
                ? 'bg-accent text-white'
                : 'border border-line bg-paper text-muted hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
