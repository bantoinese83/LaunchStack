'use client';

import type { ReactNode } from 'react';
import type { Profile, Workspace } from '@template/types';
import { AppWorkspaceProvider } from '../context/AppWorkspaceContext';
import { AppSidebar } from './AppSidebar';

export function AppShell({
  children,
  initialProfile,
  initialWorkspaces,
}: {
  children: ReactNode;
  initialProfile?: Profile | null;
  initialWorkspaces?: Workspace[];
}) {
  return (
    <AppWorkspaceProvider initialProfile={initialProfile} initialWorkspaces={initialWorkspaces}>
      <div className="flex min-h-screen bg-shell text-ink">
        <AppSidebar />
        <main className="app-main-panel flex-1 overflow-y-auto atlas-grain">{children}</main>
      </div>
    </AppWorkspaceProvider>
  );
}
