'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@template/ui';
import { Shield, Users, Building, Activity, FileText } from 'lucide-react';

export default function InternalAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'workspaces' | 'users' | 'moderation'>(
    'overview'
  );

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 border-r border-line bg-surface p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-semibold text-paper shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-semibold text-ink leading-none block">
                Admin Portal
              </span>
              <span className="text-xs text-accent font-semibold">LaunchStack Internal</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'overview'
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:bg-paper'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Platform Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('workspaces')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'workspaces'
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:bg-paper'
              }`}
            >
              <Building className="h-4 w-4" />
              <span>All Workspaces</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'users' ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-paper'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>User Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'moderation'
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:bg-paper'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Feedback Moderation</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-line pt-4">
          <Badge variant="danger" className="w-full text-center justify-center py-1">
            Super Admin Session Verified
          </Badge>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-ink capitalize">{activeTab} Dashboard</h1>
          <p className="text-muted text-sm mt-1">
            Server-verified admin operations and multi-tenant telemetry.
          </p>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <p className="text-xs font-semibold text-muted uppercase">Total MRR</p>
                <h3 className="text-3xl font-extrabold text-ink mt-2">$24,500</h3>
                <p className="text-xs text-success mt-1">+14% vs last month</p>
              </Card>

              <Card>
                <p className="text-xs font-semibold text-muted uppercase">Active Workspaces</p>
                <h3 className="text-3xl font-extrabold text-ink mt-2">142</h3>
                <p className="text-xs text-accent mt-1">92% Pro Subscriptions</p>
              </Card>

              <Card>
                <p className="text-xs font-semibold text-muted uppercase">Registered Users</p>
                <h3 className="text-3xl font-extrabold text-ink mt-2">1,280</h3>
                <p className="text-xs text-muted mt-1">320 active this week</p>
              </Card>

              <Card>
                <p className="text-xs font-semibold text-muted uppercase">Supabase RLS Status</p>
                <h3 className="text-3xl font-extrabold text-success mt-2">Protected</h3>
                <p className="text-xs text-muted mt-1">8 Policies Active</p>
              </Card>
            </div>

            {/* AUDIT LOG TABLE */}
            <Card className="border-line">
              <h3 className="text-lg font-semibold text-ink mb-4">Global Security Audit Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-muted">
                  <thead className="border-b border-line text-xs font-semibold text-muted uppercase">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Type</th>
                      <th className="py-3 px-4">Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    <tr>
                      <td className="py-3 px-4 text-xs font-mono text-muted">
                        2026-08-12 14:22:10
                      </td>
                      <td className="py-3 px-4 font-medium text-ink">alex@acme.com</td>
                      <td className="py-3 px-4">
                        <Badge variant="info">MEMBER_INVITED</Badge>
                      </td>
                      <td className="py-3 px-4">workspace_members</td>
                      <td className="py-3 px-4">Acme Corp</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-xs font-mono text-muted">
                        2026-08-12 11:05:40
                      </td>
                      <td className="py-3 px-4 font-medium text-ink">admin@launchstack.com</td>
                      <td className="py-3 px-4">
                        <Badge variant="warning">STATUS_UPDATED</Badge>
                      </td>
                      <td className="py-3 px-4">feedback_posts</td>
                      <td className="py-3 px-4">Acme Corp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'workspaces' && (
          <Card>
            <h3 className="text-lg font-semibold text-ink mb-4">Platform Workspaces</h3>
            <p className="text-sm text-muted mb-6">
              Manage customer tenants, inspect RLS state, and override subscription plans.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-paper border border-line">
                <div>
                  <h4 className="font-semibold text-ink">Acme Corp (`acme-corp`)</h4>
                  <p className="text-xs text-muted mt-0.5">
                    Owner: alex@launchstack.com | Stripe ID: sub_mock_12345
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="success">Pro Active</Badge>
                  <Button variant="outline" size="sm">
                    Inspect DB
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
