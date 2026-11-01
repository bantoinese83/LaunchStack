'use client';

import { useCallback, useState } from 'react';
import {
  MYSTIC_SERVICES,
  formatUsd,
  type MysticMenuOverridesMap,
  type ServiceId,
} from '@template/mystic';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { mysticCard, mysticInput, mysticStudioBtn } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

export function StudioMenuPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [overrides, setOverrides] = useState<MysticMenuOverridesMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    void fetch(`/api/mystic/studio/settings?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        setOverrides((data.settings?.menu_overrides ?? {}) as MysticMenuOverridesMap);
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  function patchService(id: ServiceId, field: 'priceCents' | 'description', value: string) {
    setOverrides((prev) => {
      const base = MYSTIC_SERVICES.find((s) => s.id === id)!;
      const current = prev[id] ?? {};
      if (field === 'priceCents') {
        const cents = Math.round(Number.parseFloat(value) * 100);
        return {
          ...prev,
          [id]: {
            ...current,
            priceCents: Number.isFinite(cents) ? cents : base.priceCents,
          },
        };
      }
      return { ...prev, [id]: { ...current, description: value } };
    });
  }

  async function save() {
    if (!workspaceId) return;
    setSaving(true);
    const res = await fetch('/api/mystic/studio/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, menuOverrides: overrides }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Menu saved — booking uses these prices immediately.' : 'Save failed.');
  }

  if (loading) {
    return (
      <div className={mysticCard + ' p-6'}>
        <MysticSalonLoader copyKey="settings" size="sm" />
      </div>
    );
  }

  return (
    <div className={`${mysticCard} space-y-4 p-6`}>
      <h3 className="font-medium text-ink">Menu & prices</h3>
      <p className="text-xs text-muted">Overrides ship to the booking app without a code deploy.</p>
      {MYSTIC_SERVICES.map((service) => {
        const patch = overrides[service.id];
        const priceUsd = ((patch?.priceCents ?? service.priceCents) / 100).toFixed(2);
        return (
          <div key={service.id} className="border-t border-line/50 pt-4 first:border-0 first:pt-0">
            <p className="font-medium text-ink">{service.name}</p>
            <p className="text-xs text-muted">Default {formatUsd(service.priceCents)}</p>
            <label className="mt-2 block text-sm">
              Price (USD)
              <input
                type="text"
                inputMode="decimal"
                value={priceUsd}
                onChange={(e) => patchService(service.id, 'priceCents', e.target.value)}
                className={`${mysticInput} mt-1`}
              />
            </label>
            <label className="mt-2 block text-sm">
              Description
              <textarea
                value={patch?.description ?? service.description}
                onChange={(e) => patchService(service.id, 'description', e.target.value)}
                rows={2}
                className={`${mysticInput} mt-1`}
              />
            </label>
          </div>
        );
      })}
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={mysticStudioBtn}
      >
        {saving ? 'Saving…' : 'Save menu'}
      </button>
    </div>
  );
}
