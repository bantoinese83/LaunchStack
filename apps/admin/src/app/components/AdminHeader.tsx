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
  flags: 'Feature flags',
};

const eyebrows: Record<AdminTab, string> = {
  overview: 'Telemetry',
  workspaces: 'Tenants',
  users: 'Directory',
  moderation: 'Trust & safety',
  flags: 'Rollouts',
};

export function AdminHeader({ activeTab }: AdminHeaderProps) {
  return (
    <header className="mb-8">
      <p className="type-eyebrow text-accent">{eyebrows[activeTab]}</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
        {titles[activeTab]}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Server-verified admin operations and multi-tenant telemetry.
      </p>
    </header>
  );
}
