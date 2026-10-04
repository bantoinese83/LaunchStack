'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@template/ui';
import type { FeatureFlag } from '@template/types';
import { adminFetch } from '@/lib/admin-fetch';

export function FlagsTab() {
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [key, setKey] = useState('new_flag');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await adminFetch('/api/admin/flags');
        if (!response.ok) throw new Error('Could not load flags');
        const payload = (await response.json()) as { flags: FeatureFlag[] };
        if (!cancelled) setFlags(payload.flags);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Load failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setError(null);
    const response = await adminFetch('/api/admin/flags', {
      method: 'POST',
      body: JSON.stringify({
        key,
        description,
        enabled_globally: enabled,
        target_workspaces: [],
      }),
    });
    if (!response.ok) {
      setError('Could not save flag');
      return;
    }
    setDescription('');
    const list = await adminFetch('/api/admin/flags');
    if (list.ok) {
      const payload = (await list.json()) as { flags: FeatureFlag[] };
      setFlags(payload.flags);
    }
  };

  return (
    <Card className="space-y-5 animate-[rise_350ms_ease-out]">
      <div>
        <p className="type-eyebrow text-accent">Rollouts</p>
        <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-ink">
          Feature flags
        </h3>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled globally
        </label>
      </div>
      <Button variant="primary" onClick={() => void save()}>
        Save flag
      </Button>
      <div className="space-y-2">
        {(flags ?? []).map((flag) => (
          <div key={flag.id} className="rounded-xl border border-line p-3">
            <p className="font-medium text-ink">{flag.key}</p>
            <p className="text-sm text-muted">{flag.description}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              global: {flag.enabled_globally ? 'on' : 'off'}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
