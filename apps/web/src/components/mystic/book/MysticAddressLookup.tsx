'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { AddressSuggestion } from '@template/mystic';
import { mysticInput } from '@/components/mystic/mystic-styles';

export type HouseCallAddress = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
};

type Props = {
  address: HouseCallAddress;
  onChange: (next: HouseCallAddress) => void;
  onSuggestionSelected?: (suggestion: AddressSuggestion) => void;
};

export function MysticAddressLookup({ address, onChange, onSuggestionSelected }: Props) {
  const listId = useId();
  const [lookup, setLookup] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lookup.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setBusy(true);
      void fetch(`/api/mystic/geocode/autocomplete?q=${encodeURIComponent(lookup.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setSuggestions((data.suggestions ?? []) as AddressSuggestion[]);
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setBusy(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [lookup]);

  function pick(s: AddressSuggestion) {
    onChange({
      ...address,
      line1: s.line1,
      city: s.city,
      state: s.state,
      postalCode: s.postalCode,
    });
    setLookup('');
    setSuggestions([]);
    setOpen(false);
    onSuggestionSelected?.(s);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <label className="text-sm font-medium text-ink" htmlFor={`${listId}-lookup`}>
          Search address
        </label>
        <input
          id={`${listId}-lookup`}
          type="search"
          autoComplete="off"
          placeholder="Start typing street, city, or ZIP…"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          className={`${mysticInput} mt-1 w-full`}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
        />
        {busy ? <p className="mt-1 text-xs text-muted">Looking up addresses…</p> : null}
        {open && suggestions.length > 0 ? (
          <ul
            id={`${listId}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-md"
          >
            {suggestions.map((s) => (
              <li key={s.id} role="option">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent-soft"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {open && !busy && lookup.trim().length >= 3 && suggestions.length === 0 ? (
          <p className="mt-1 text-xs text-muted">No matches — refine or enter fields below.</p>
        ) : null}
      </div>

      <input
        placeholder="Street address"
        value={address.line1}
        onChange={(e) => onChange({ ...address, line1: e.target.value })}
        className={`${mysticInput} w-full`}
        autoComplete="address-line1"
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          placeholder="City"
          value={address.city}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
          className={`${mysticInput} col-span-2`}
          autoComplete="address-level2"
        />
        <input
          placeholder="ST"
          value={address.state}
          onChange={(e) =>
            onChange({ ...address, state: e.target.value.toUpperCase().slice(0, 2) })
          }
          className={`${mysticInput} uppercase`}
          autoComplete="address-level1"
          maxLength={2}
        />
      </div>
      <input
        placeholder="ZIP"
        value={address.postalCode}
        onChange={(e) =>
          onChange({ ...address, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })
        }
        className={`${mysticInput} w-full`}
        autoComplete="postal-code"
        inputMode="numeric"
      />
    </div>
  );
}
