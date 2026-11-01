'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { buildDiceBearGallery, parseDiceBearAvatarUrl } from '@template/mystic';

type Props = {
  defaultSeed: string;
  selectedUrl: string | null;
  busy?: boolean;
  onPick: (style: string, seed: string) => void;
};

export function MysticAvatarMarquee({ defaultSeed, selectedUrl, busy = false, onPick }: Props) {
  const [shuffleKey, setShuffleKey] = useState('');
  const gallery = useMemo(
    () => buildDiceBearGallery(defaultSeed, { variants: 3, size: 96, shuffleKey }),
    [defaultSeed, shuffleKey]
  );
  const selected = useMemo(
    () => (selectedUrl ? parseDiceBearAvatarUrl(selectedUrl) : null),
    [selectedUrl]
  );

  return (
    <div className="w-full border-t border-line/70 pt-4">
      <div className="mb-3 flex h-0.5 w-[4.5rem] overflow-hidden rounded-[1px]" aria-hidden>
        <span className="h-full flex-[5] bg-gold" />
        <span className="h-full flex-[2] bg-plum" />
        <span className="h-full flex-[3] bg-accent" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="type-eyebrow text-chalk">Looks</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => setShuffleKey(Math.random().toString(36).slice(2, 8))}
          className="text-xs font-medium tracking-wide text-plum underline decoration-plum/40 underline-offset-4 disabled:opacity-50"
        >
          Shuffle
        </button>
      </div>
      <div
        className="mt-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="grid w-max grid-flow-col grid-rows-2 gap-2.5 pr-2"
          role="listbox"
          aria-label="Avatar choices"
        >
          {gallery.map((item) => {
            const isOn = selected?.style === item.style && selected.seed === item.seed;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isOn}
                disabled={busy}
                onClick={() => onPick(item.style, item.seed)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-surface transition-[transform,border-color] duration-200 disabled:opacity-50 ${
                  isOn
                    ? 'border-[2.5px] border-gold shadow-[0_0_0_3px_color-mix(in_oklab,var(--gold)_22%,transparent)]'
                    : 'border-line hover:scale-[1.04] hover:border-gold/55'
                }`}
              >
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
