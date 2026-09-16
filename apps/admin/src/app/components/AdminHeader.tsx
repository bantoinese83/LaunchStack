import React from 'react';
import { AdminTab } from '../types';

interface AdminHeaderProps {
  activeTab: AdminTab;
}

const titles: Record<AdminTab, string> = {
  overview: 'Platform overview',
  workspaces: 'Workspaces',
  users: 'User accounts',
  moderation: 'Feedback moderation',
};

export function AdminHeader({ activeTab }: AdminHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {titles[activeTab]}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Server-verified admin operations and multi-tenant telemetry.
      </p>
    </header>
  );
}
