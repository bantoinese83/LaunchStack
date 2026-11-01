'use client';

import { useState } from 'react';
import { MysticAiOrb } from '@/components/mystic/MysticAiOrb';

type Brief = {
  headline: string;
  bullets: string[];
  bring?: string;
  vibe?: string;
  opener?: string;
  watchouts?: string[];
  kit?: string[];
};

export function AiStopBrief({
  workspaceId,
  appointmentId,
}: {
  workspaceId: string;
  appointmentId: string;
}) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  async function load(force = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/mystic/ai/stop-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, appointmentId, force }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load brief');
        return;
      }
      setBrief(data.brief);
      setCached(Boolean(data.cached));
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-line/70 bg-paper/70 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MysticAiOrb active={busy} size="xs" label="AI stop brief" />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            AI stop brief
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void load(Boolean(brief))}
          className="text-xs font-medium text-accent underline disabled:opacity-50"
        >
          {busy ? 'Thinking…' : brief ? 'Refresh' : 'Prep me'}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      {brief ? (
        <div className="mt-2 space-y-1.5">
          <p className="text-sm font-medium text-ink">{brief.headline}</p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-muted">
            {brief.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {brief.opener ? (
            <p className="text-xs text-ink">
              <span className="font-medium">Opener:</span> {brief.opener}
            </p>
          ) : null}
          {brief.bring ? (
            <p className="text-xs text-chalk">
              <span className="font-medium text-ink">Bring:</span> {brief.bring}
            </p>
          ) : null}
          {brief.kit && brief.kit.length > 0 ? (
            <p className="text-xs text-muted">
              <span className="font-medium text-ink">Kit:</span> {brief.kit.join(' · ')}
            </p>
          ) : null}
          {brief.watchouts && brief.watchouts.length > 0 ? (
            <p className="text-xs text-plum">
              <span className="font-medium">Watch:</span> {brief.watchouts.join(' · ')}
            </p>
          ) : null}
          {brief.vibe ? <p className="text-xs text-muted">Vibe: {brief.vibe}</p> : null}
          {cached ? (
            <p className="text-[10px] text-muted">Cached · regenerates after cooldown</p>
          ) : null}
        </div>
      ) : !error ? (
        <p className="mt-1 text-xs text-muted">One tap for notes, opener, kit, and watchouts.</p>
      ) : null}
    </div>
  );
}
