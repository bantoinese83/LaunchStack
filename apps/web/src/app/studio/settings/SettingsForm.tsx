'use client';

import { useEffect, useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export function SettingsForm() {
  const workspaceId = getMysticWorkspaceId();
  const [winterBufferEnabled, setWinterBufferEnabled] = useState(false);
  const [doorTimerMinutes, setDoorTimerMinutes] = useState(15);
  const [depositCents, setDepositCents] = useState(2500);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/studio/settings?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setWinterBufferEnabled(data.settings.winter_buffer_enabled);
          setDoorTimerMinutes(data.settings.door_timer_minutes);
          setDepositCents(data.settings.deposit_cents);
        }
      });
  }, [workspaceId]);

  async function save() {
    if (!workspaceId) return;
    const res = await fetch('/api/mystic/studio/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        winterBufferEnabled,
        doorTimerMinutes,
        depositCents,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Saved' : data.error);
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={winterBufferEnabled}
          onChange={(e) => setWinterBufferEnabled(e.target.checked)}
        />
        Winter buffer (45 min between stops)
      </label>
      <label className="block text-sm">
        Door timer (minutes)
        <input
          type="number"
          value={doorTimerMinutes}
          onChange={(e) => setDoorTimerMinutes(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Deposit (cents)
        <input
          type="number"
          value={depositCents}
          onChange={(e) => setDepositCents(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={save}
        className="rounded-full bg-shell px-5 py-2 text-sm text-paper"
      >
        Save settings
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
