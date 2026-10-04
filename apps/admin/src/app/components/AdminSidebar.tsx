'use client';

import React from 'react';
import { Badge, BrandMark } from '@template/ui';
import { Shield, Users, Building, Activity, FileText, Flag } from 'lucide-react';
import { AdminTab } from '../types';

const NAV: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Platform metrics', icon: Activity },
  { id: 'workspaces', label: 'All workspaces', icon: Building },
  { id: 'users', label: 'User accounts', icon: Users },
  { id: 'moderation', label: 'Feedback moderation', icon: FileText },
  { id: 'flags', label: 'Feature flags', icon: Flag },
];

function navButtonClass(isActive: boolean) {
  return isActive
    ? 'flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-left text-sm font-medium text-paper ring-1 ring-white/10'
    : 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-paper';
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
    <aside className="flex w-[17.5rem] shrink-0 flex-col justify-between border-r border-white/8 bg-shell p-5 text-paper">
      <div>
        <div className="mb-8 flex items-center gap-3 px-1">
          <BrandMark size="sm" tone="paper" />
          <div>
            <span className="block font-display text-lg font-medium leading-none tracking-tight">
              Admin
            </span>
            <span className="type-eyebrow mt-1.5 block text-accent">LaunchStack</span>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={navButtonClass(activeTab === id)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
          <Shield className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <Badge variant="danger" className="border-red-400/30 bg-red-500/15 text-red-100">
            Super admin
          </Badge>
        </div>
      </div>
    </aside>
  );
}
