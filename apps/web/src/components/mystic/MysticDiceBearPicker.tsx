'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  DICEBEAR_STYLES,
  buildDiceBearAvatarUrl,
  parseDiceBearAvatarUrl,
  sanitizeDiceBearSeed,
  type DiceBearStyleId,
} from '@template/mystic';

type Props = {
  open: boolean;
  onClose: () => void;
  initialUrl: string | null;
  defaultSeed: string;
  onSave: (url: string) => Promise<void>;
  busy?: boolean;
};

export function MysticDiceBearPicker({
  open,
  onClose,
  initialUrl,
  defaultSeed,
  onSave,
  busy = false,
}: Props) {
  const parsed = useMemo(
    () => (initialUrl ? parseDiceBearAvatarUrl(initialUrl) : null),
    [initialUrl]
  );
  const [style, setStyle] = useState<DiceBearStyleId>(parsed?.style ?? 'lorelei');
  const [seed, setSeed] = useState(parsed?.seed ?? defaultSeed);

  const previewUrl = useMemo(() => buildDiceBearAvatarUrl(style, seed, 128), [style, seed]);

  if (!open) return null;

  function shuffleSeed() {
    setSeed(`${defaultSeed}-${Math.random().toString(36).slice(2, 8)}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dicebear-title"
    >
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-lg">
        <h2 id="dicebear-title" className="font-display text-lg text-ink">
          Choose a DiceBear avatar
        </h2>
        <p className="mt-1 text-sm text-muted">Generated art — no upload needed.</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-accent-soft">
            <Image src={previewUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <label className="text-xs font-medium text-muted" htmlFor="dicebear-seed">
              Seed (changes the look)
            </label>
            <input
              id="dicebear-seed"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
              value={seed}
              onChange={(e) => setSeed(sanitizeDiceBearSeed(e.target.value))}
            />
            <button
              type="button"
              className="mt-2 text-xs font-medium text-accent underline-offset-2 hover:underline"
              onClick={shuffleSeed}
            >
              Randomize
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DICEBEAR_STYLES.map((s) => {
            const thumb = buildDiceBearAvatarUrl(s.id, seed, 64);
            const selected = style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-colors ${
                  selected
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-paper hover:bg-accent-soft/50'
                }`}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-medium"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
            disabled={busy}
            onClick={() => void onSave(buildDiceBearAvatarUrl(style, seed, 256))}
          >
            {busy ? 'Saving…' : 'Use this avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
