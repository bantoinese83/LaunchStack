'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, BrandMark, Button, fieldSelectDarkClassName } from '@template/ui';
import { isSuperAdmin } from '@template/auth';
import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  ShieldCheck,
  UserRound,
  CircleUser,
  Flag,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { signOutFromBrowser } from '@/lib/supabase/browser-session';
import { useAppWorkspace } from '../context/AppWorkspaceContext';

const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

function navLinkClassName(isActive: boolean) {
  return isActive
    ? 'flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-paper ring-1 ring-white/10'
    : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-paper';
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const {
    profile,
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    isWorkspaceSwitching,
    isPageDataLoading,
  } = useAppWorkspace();

  const workspaceLoading = isWorkspaceSwitching || isPageDataLoading;

  const handleSignOut = async () => {
    await signOutFromBrowser();
    router.push('/login');
  };

  return (
    <aside className="flex w-[17.5rem] shrink-0 flex-col justify-between border-r border-white/8 bg-shell p-5 text-paper">
      <div>
        <div className="mb-8 flex items-center gap-3 px-1">
          <BrandMark size="sm" tone="paper" />
          <div>
            <span className="font-display text-lg font-medium tracking-tight text-paper">
              LaunchStack
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              Workspace
            </p>
          </div>
        </div>

        <div className="mb-6 px-1">
          <label
            htmlFor="workspace-switcher"
            className="mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/45"
          >
            Active tenant
          </label>
          <select
            id="workspace-switcher"
            value={selectedWorkspace?.id || ''}
            disabled={workspaceLoading || workspaces.length === 0}
            aria-busy={workspaceLoading}
            aria-describedby={workspaceLoading ? 'workspace-switcher-status' : undefined}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) selectWorkspace(ws);
            }}
            className={fieldSelectDarkClassName}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-shell text-paper">
                {ws.name}
              </option>
            ))}
          </select>
          {workspaceLoading && (
            <p
              id="workspace-switcher-status"
              className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-white/45"
              role="status"
            >
              Loading…
            </p>
          )}
        </div>

        <nav className="space-y-1" aria-label="App navigation">
          <Link href="/dashboard" className={navLinkClassName(pathname === '/dashboard')}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>{t.overview}</span>
          </Link>
          <Link href="/feedback" className={navLinkClassName(pathname === '/feedback')}>
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>{t.feedback}</span>
          </Link>
          <Link
            href="/settings/profile"
            className={navLinkClassName(pathname.startsWith('/settings/profile'))}
          >
            <CircleUser className="h-4 w-4 shrink-0" />
            <span>{t.profile}</span>
          </Link>
          <Link
            href="/settings/security"
            className={navLinkClassName(pathname.startsWith('/settings/security'))}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{t.security}</span>
          </Link>
          <Link
            href="/settings/privacy"
            className={navLinkClassName(pathname.startsWith('/settings/privacy'))}
          >
            <UserRound className="h-4 w-4 shrink-0" />
            <span>{t.privacy}</span>
          </Link>
          <Link
            href="/settings/flags"
            className={navLinkClassName(pathname.startsWith('/settings/flags'))}
          >
            <Flag className="h-4 w-4 shrink-0" />
            <span>Flags</span>
          </Link>
          {isSuperAdmin(profile?.system_role) && (
            <a
              href={ADMIN_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent/10"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Admin Portal</span>
            </a>
          )}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              name={profile?.full_name || profile?.email || 'User'}
              src={profile?.avatar_url}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-none text-paper">
                {profile?.full_name || 'User'}
              </p>
              <p className="mt-1 truncate text-xs text-white/45">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title="Sign Out"
            aria-label="Sign out"
            className="text-white/50 hover:bg-white/5 hover:text-paper"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
