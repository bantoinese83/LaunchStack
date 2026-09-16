'use client';

import React, { useState } from 'react';
import { EmptyState } from '@template/ui';
import { AdminTab } from './types';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { OverviewTab } from './components/OverviewTab';
import { WorkspacesTab } from './components/WorkspacesTab';

export default function InternalAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <AdminHeader activeTab={activeTab} />

        {activeTab === 'overview' && <OverviewTab />}

        {activeTab === 'workspaces' && <WorkspacesTab />}

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
