import React from 'react';
import { Card, StatsCard, Badge } from '@template/ui';

export function OverviewTab() {
  return (
    <div className="space-y-6 animate-[rise_350ms_ease-out]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
        <StatsCard title="Total MRR" value="$24,500" change="+14%" subtext="vs last month" />
        <StatsCard
          title="Active workspaces"
          value="142"
          change="92% Pro"
          subtext="Paying tenants"
        />
        <StatsCard title="Registered users" value="1,280" change="320 active" subtext="This week" />
        <StatsCard
          title="RLS status"
          value="Protected"
          change="8 policies"
          subtext="All tenant tables"
        />
      </div>

      <Card>
        <h3 className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">
          Global security audit log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Actor</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Target</th>
                <th className="px-3 py-3">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="transition-colors hover:bg-paper/70">
                <td className="px-3 py-3 font-mono text-xs text-muted">2026-08-12 14:22:10</td>
                <td className="px-3 py-3 font-medium text-ink">alex@acme.com</td>
                <td className="px-3 py-3">
                  <Badge variant="info">Member invited</Badge>
                </td>
                <td className="px-3 py-3">workspace_members</td>
                <td className="px-3 py-3">Acme Corp</td>
              </tr>
              <tr className="transition-colors hover:bg-paper/70">
                <td className="px-3 py-3 font-mono text-xs text-muted">2026-08-12 11:05:40</td>
                <td className="px-3 py-3 font-medium text-ink">admin@launchstack.com</td>
                <td className="px-3 py-3">
                  <Badge variant="warning">Status updated</Badge>
                </td>
                <td className="px-3 py-3">feedback_posts</td>
                <td className="px-3 py-3">Acme Corp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
