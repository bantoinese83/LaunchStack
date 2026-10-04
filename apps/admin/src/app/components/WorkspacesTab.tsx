'use client';

import { useState } from 'react';
import { Badge, Card } from '@template/ui';
import type { AdminWorkspaceRow } from '@/lib/admin-data';
import { adminFetch } from '@/lib/admin-fetch';

export function WorkspacesTab({ workspaces }: { workspaces: AdminWorkspaceRow[] }) {
  const [rows, setRows] = useState(workspaces);
  const [error, setError] = useState<string | null>(null);

  const setOverride = async (
    workspaceId: string,
    planOverride: 'free' | 'pro' | 'enterprise' | null
  ) => {
    setError(null);
    const response = await adminFetch('/api/admin/plan', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, planOverride }),
    });
    if (!response.ok) {
      setError('Could not update plan override');
      return;
    }
    setRows((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, plan_override: planOverride } : workspace
      )
    );
  };

  return (
    <Card className="animate-[rise_350ms_ease-out]">
      <p className="type-eyebrow text-accent">Tenants</p>
      <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-ink">
        Platform workspaces
      </h3>
      <p className="mb-6 mt-1 text-sm text-muted">
        Live tenant list from the service-role admin client. Override plan limits without Stripe.
      </p>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No workspaces yet.</p>
        ) : (
          rows.map((workspace) => (
            <div
              key={workspace.id}
              className="flex flex-col gap-3 rounded-xl border border-line bg-paper/80 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h4 className="font-semibold text-ink">{workspace.name}</h4>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  slug: {workspace.slug} · owner: {workspace.owner_email || 'unknown'} · members:{' '}
                  {workspace.member_count}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={workspace.subscription_status === 'active' ? 'success' : 'info'}>
                  {workspace.subscription_status || 'no subscription'}
                </Badge>
                <select
                  className="rounded-md border border-line bg-surface px-2 py-1 text-xs"
                  value={workspace.plan_override ?? ''}
                  onChange={(event) =>
                    void setOverride(
                      workspace.id,
                      (event.target.value || null) as 'free' | 'pro' | 'enterprise' | null
                    )
                  }
                >
                  <option value="">No override</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
