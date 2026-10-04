'use client';

import React, { useState } from 'react';
import type { AuditLog, Profile } from '@template/types';
import { AdminTab } from '../types';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { OverviewTab } from '../components/OverviewTab';
import { WorkspacesTab } from '../components/WorkspacesTab';
import { UsersTab } from '../components/UsersTab';
import { ModerationTab } from '../components/ModerationTab';
import { FlagsTab } from '../components/FlagsTab';
import type { AdminOverview, AdminWorkspaceRow } from '@/lib/admin-data';

export function AdminDashboard({
  overview,
  workspaces,
  users,
  auditLogs,
}: {
  overview: AdminOverview;
  workspaces: AdminWorkspaceRow[];
  users: Profile[];
  auditLogs: AuditLog[];
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="flex min-h-screen bg-shell text-ink">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="app-main-panel flex-1 overflow-y-auto atlas-grain p-6 md:p-8">
        <AdminHeader activeTab={activeTab} />

        {activeTab === 'overview' && <OverviewTab overview={overview} auditLogs={auditLogs} />}
        {activeTab === 'workspaces' && <WorkspacesTab workspaces={workspaces} />}
        {activeTab === 'users' && <UsersTab users={users} />}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'flags' && <FlagsTab />}
      </main>
    </div>
  );
}
