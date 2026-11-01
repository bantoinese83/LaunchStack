'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { MysticAvatarMarquee } from '@/components/mystic/MysticAvatarMarquee';
import { mysticAvatarFrameClass } from '@/components/mystic/mystic-avatar-frame';

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
  size = 112,
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const url = uploadedUrl ?? avatarUrl;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setUploadedUrl(data.url);
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

  async function saveGenerated(style: string, seed: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, seed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not save');
        return;
      }
      setUploadedUrl(data.url);
      onUploaded?.(data.url);
    } catch {
      setError('Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className={`relative overflow-hidden border-2 ${mysticAvatarFrameClass('border-line bg-accent-soft')}`}
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
          Selfie
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium hover:bg-accent-soft"
          onClick={() => uploadRef.current?.click()}
        >
          Photo
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

      <MysticAvatarMarquee
        defaultSeed={seedDefault}
        selectedUrl={url}
        busy={busy}
        onPick={(style, seed) => void saveGenerated(style, seed)}
      />

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
