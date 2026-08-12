'use client';

import React, { useState } from 'react';
import { Badge, Button, Card, EmptyState, StatsCard } from '@template/ui';
import { Shield, Users, Building, Activity, FileText } from 'lucide-react';

type AdminTab = 'overview' | 'workspaces' | 'users' | 'moderation';

const NAV: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Platform metrics', icon: Activity },
  { id: 'workspaces', label: 'All workspaces', icon: Building },
  { id: 'users', label: 'User accounts', icon: Users },
  { id: 'moderation', label: 'Feedback moderation', icon: FileText },
];

export default function InternalAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const titles: Record<AdminTab, string> = {
    overview: 'Platform overview',
    workspaces: 'Workspaces',
    users: 'User accounts',
    moderation: 'Feedback moderation',
  };

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-line bg-surface p-5">
        <div>
          <div className="mb-8 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-paper">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-display text-lg font-semibold leading-none tracking-tight">
                Admin
              </span>
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                LaunchStack
              </span>
            </div>
          </div>

          <nav className="space-y-0.5">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-line pt-4">
          <Badge variant="danger" className="w-full justify-center py-1.5">
            Super admin session
          </Badge>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {titles[activeTab]}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Server-verified admin operations and multi-tenant telemetry.
          </p>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-[rise_350ms_ease-out]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
              <StatsCard title="Total MRR" value="$24,500" change="+14%" subtext="vs last month" />
              <StatsCard
                title="Active workspaces"
                value="142"
                change="92% Pro"
                subtext="Paying tenants"
              />
              <StatsCard
                title="Registered users"
                value="1,280"
                change="320 active"
                subtext="This week"
              />
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
                      <td className="px-3 py-3 font-mono text-xs text-muted">
                        2026-08-12 14:22:10
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">alex@acme.com</td>
                      <td className="px-3 py-3">
                        <Badge variant="info">Member invited</Badge>
                      </td>
                      <td className="px-3 py-3">workspace_members</td>
                      <td className="px-3 py-3">Acme Corp</td>
                    </tr>
                    <tr className="transition-colors hover:bg-paper/70">
                      <td className="px-3 py-3 font-mono text-xs text-muted">
                        2026-08-12 11:05:40
                      </td>
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
        )}

        {activeTab === 'workspaces' && (
          <Card className="animate-[rise_350ms_ease-out]">
            <h3 className="mb-1 font-display text-lg font-semibold tracking-tight text-ink">
              Platform workspaces
            </h3>
            <p className="mb-6 text-sm text-muted">
              Manage customer tenants, inspect RLS state, and override subscription plans.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-md border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-ink">Acme Corp</h4>
                  <p className="mt-0.5 text-xs text-muted">
                    slug: acme-corp · Owner: alex@launchstack.com · Stripe: sub_mock_12345
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Pro Active</Badge>
                  <Button variant="outline" size="sm">
                    Inspect
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {(activeTab === 'users' || activeTab === 'moderation') && (
          <EmptyState
            className="animate-[rise_350ms_ease-out]"
            title={activeTab === 'users' ? 'User directory coming soon' : 'Moderation queue empty'}
            description={
              activeTab === 'users'
                ? 'Wire this panel to DomainAPI profile listings when you connect live admin auth.'
                : 'No flagged feedback posts need review right now.'
            }
          />
        )}
      </main>
    </div>
  );
}
