import React from 'react';
import Link from 'next/link';
import { Avatar, BrandMark, Button, fieldSelectClassName } from '@template/ui';
import { Workspace, Profile } from '@template/types';
import { isSuperAdmin } from '@template/auth';
import { LayoutDashboard, MessageSquare, LogOut, Shield } from 'lucide-react';
import { createSupabaseBrowserClient } from '@template/api';
import { useRouter } from 'next/navigation';

const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

interface DashboardSidebarProps {
  profile: Profile | null;
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  onWorkspaceSelect: (ws: Workspace) => void;
}

export function DashboardSidebar({
  profile,
  workspaces,
  selectedWorkspace,
  onWorkspaceSelect,
}: DashboardSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-line bg-surface/70 backdrop-blur-xl p-5">
      <div>
        <div className="mb-8 flex items-center gap-3 px-1">
          <BrandMark size="sm" />
          <span className="font-display text-lg font-semibold tracking-tight">LaunchStack</span>
        </div>

        <div className="mb-6 px-1">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Workspace
          </label>
          <select
            value={selectedWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) onWorkspaceSelect(ws);
            }}
            className={fieldSelectClassName}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          <Link
            href="/feedback"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Feedback</span>
          </Link>
          {isSuperAdmin(profile?.system_role) && (
            <a
              href={ADMIN_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-soft"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </a>
          )}
        </nav>
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={profile?.full_name || profile?.email || 'User'} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-ink">
                {profile?.full_name || 'User'}
              </p>
              <p className="mt-1 truncate text-xs text-muted">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-muted" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
