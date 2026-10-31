'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { parseDiceBearAvatarUrl } from '@template/mystic';
import { MysticDiceBearPicker } from '@/components/mystic/MysticDiceBearPicker';

type Props = {
  avatarUrl: string | null;
  name?: string;
  diceBearDefaultSeed?: string;
  onUploaded?: (url: string) => void;
  size?: number;
};

export function MysticProfileAvatar({
  avatarUrl,
  name,
  diceBearDefaultSeed,
  onUploaded,
  size = 96,
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(avatarUrl);
  useEffect(() => {
    setUrl(avatarUrl);
  }, [avatarUrl]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diceOpen, setDiceOpen] = useState(false);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const seedDefault = diceBearDefaultSeed?.trim() || name?.trim() || 'mystic';

  async function uploadFile(file: File) {
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
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFile(file);
  }

  async function saveDiceBear(nextUrl: string) {
    const parsed = parseDiceBearAvatarUrl(nextUrl);
    if (!parsed) {
      setError('Invalid DiceBear avatar');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: parsed.style, seed: parsed.seed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not save avatar');
        return;
      }
      setUrl(data.url);
      onUploaded?.(data.url);
      setDiceOpen(false);
    } catch {
      setError('Could not save avatar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden rounded-full border-2 border-line bg-accent-soft"
        style={{ width: size, height: size }}
      >
        {url ? (
          <Image
            src={url}
            alt=""
            fill
            className="object-cover"
            sizes={`${size}px`}
            unoptimized={url.includes('dicebear.com')}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl text-accent">
            {initial}
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-xs text-paper">
            …
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          disabled={busy}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium hover:bg-accent-soft"
          onClick={() => cameraRef.current?.click()}
        >
          Take selfie
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium hover:bg-accent-soft"
          onClick={() => uploadRef.current?.click()}
        >
          Upload photo
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-full border border-accent bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent"
          onClick={() => setDiceOpen(true)}
        >
          DiceBear
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={(ev) => void onPick(ev)}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(ev) => void onPick(ev)}
      />

      <p className="text-center text-xs text-muted">
        Photo uploads go to your profile storage. DiceBear avatars are saved as a link — Luke sees
        either in Studio.
      </p>
      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <MysticDiceBearPicker
        open={diceOpen}
        onClose={() => setDiceOpen(false)}
        initialUrl={url}
        defaultSeed={seedDefault}
        onSave={saveDiceBear}
        busy={busy}
      />
    </div>
  );
}
