import React from 'react';
import { Badge } from '@template/ui';
import { Shield, Users, Building, Activity, FileText } from 'lucide-react';
import { AdminTab } from '../types';

const NAV: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Platform metrics', icon: Activity },
  { id: 'workspaces', label: 'All workspaces', icon: Building },
  { id: 'users', label: 'User accounts', icon: Users },
  { id: 'moderation', label: 'Feedback moderation', icon: FileText },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
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
  );
}
