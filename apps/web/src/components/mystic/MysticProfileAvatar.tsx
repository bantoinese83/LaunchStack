'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Props = {
  avatarUrl: string | null;
  name?: string;
  onUploaded?: (url: string) => void;
  size?: number;
};

export function MysticProfileAvatar({ avatarUrl, name, onUploaded, size = 96 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(avatarUrl);
  useEffect(() => {
    setUrl(avatarUrl);
  }, [avatarUrl]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed');
        return;
      }
      setUrl(data.url);
      onUploaded?.(data.url);
    } catch {
      setError('Upload failed');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative overflow-hidden rounded-full border-2 border-line bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
        style={{ width: size, height: size }}
        aria-label={url ? 'Change profile photo' : 'Upload profile photo'}
      >
        {url ? (
          <Image src={url} alt="" fill className="object-cover" sizes={`${size}px`} />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl text-accent">
            {initial}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-ink/50 py-0.5 text-[10px] text-paper">
          {busy ? '…' : 'Photo'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(ev) => void onPick(ev)}
      />
      <p className="text-center text-xs text-muted">
        Stored in your profile — Luke sees this in Studio.
      </p>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
