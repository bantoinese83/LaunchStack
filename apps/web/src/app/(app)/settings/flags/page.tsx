'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Card } from '@template/ui';
import type { FeatureFlag } from '@template/types';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { useAppWorkspace } from '../../context/AppWorkspaceContext';

type FlagRow = FeatureFlag & { enabled: boolean };

export default function FeatureFlagsPage() {
  const { selectedWorkspace } = useAppWorkspace();
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const query = selectedWorkspace?.id ? `?workspaceId=${selectedWorkspace.id}` : '';
        const response = await authorizedFetch(`/api/flags${query}`);
        if (!response.ok) throw new Error(await readApiError(response, 'Could not load flags'));
        const payload = (await response.json()) as { flags: FlagRow[] };
        if (!cancelled) setFlags(payload.flags);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load flags');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedWorkspace?.id]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          Workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Feature flags
        </h1>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <Card className="space-y-3 p-6">
        {flags.length === 0 ? (
          <p className="text-sm text-muted">No flags configured yet.</p>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-lg border border-line p-3"
            >
              <div>
                <p className="font-medium text-ink">{flag.key}</p>
                <p className="text-sm text-muted">{flag.description}</p>
              </div>
              <Badge variant={flag.enabled ? 'success' : 'info'}>
                {flag.enabled ? 'On' : 'Off'}
              </Badge>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
