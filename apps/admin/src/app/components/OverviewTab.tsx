import React from 'react';
import { Badge, Card, StatsCard } from '@template/ui';
import type { AuditLog } from '@template/types';
import type { AdminOverview } from '@/lib/admin-data';

export function OverviewTab({
  overview,
  auditLogs,
}: {
  overview: AdminOverview;
  auditLogs: AuditLog[];
}) {
  return (
    <div className="space-y-6 animate-[rise_350ms_ease-out]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
        <StatsCard
          title="Workspaces"
          value={String(overview.workspaceCount)}
          subtext="Live tenants"
        />
        <StatsCard
          title="Active subscriptions"
          value={String(overview.activeSubscriptions)}
          subtext="status = active"
        />
        <StatsCard title="Registered users" value={String(overview.userCount)} subtext="profiles" />
        <StatsCard
          title="Recent audit events"
          value={String(overview.auditCount)}
          subtext="Latest 20 rows"
        />
      </div>

      <Card>
        <h3 className="mb-1 font-display text-lg font-medium tracking-tight text-ink">
          Global security audit log
        </h3>
        <p className="mb-4 text-sm text-muted">Recent cross-tenant actions from the audit trail.</p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm text-muted">
            <thead className="border-b border-line bg-paper/80">
              <tr>
                <th className="type-eyebrow px-3 py-3 text-muted">Timestamp</th>
                <th className="type-eyebrow px-3 py-3 text-muted">Actor</th>
                <th className="type-eyebrow px-3 py-3 text-muted">Action</th>
                <th className="type-eyebrow px-3 py-3 text-muted">Target</th>
                <th className="type-eyebrow px-3 py-3 text-muted">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {auditLogs.length === 0 ? (
                <tr>
                  <td className="px-3 py-4" colSpan={5}>
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-accent-soft/40">
                    <td className="px-3 py-3 font-mono text-xs text-muted">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-medium text-ink">
                      {row.actor?.email || row.actor_id}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="info">{row.action}</Badge>
                    </td>
                    <td className="px-3 py-3">{row.target_type}</td>
                    <td className="px-3 py-3">{row.workspace_id || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
