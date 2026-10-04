'use client';

import { usePathname } from 'next/navigation';
import type { Profile, Workspace } from '@template/types';
import { AppShell } from './components/AppShell';

const SHELL_ROUTES = ['/dashboard', '/feedback', '/settings'];

export function AppLayoutClient({
  children,
  initialProfile,
  initialWorkspaces,
}: {
  children: React.ReactNode;
  initialProfile: Profile | null;
  initialWorkspaces: Workspace[];
}) {
  const pathname = usePathname();
  const useShell = SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!useShell) {
    return children;
  }

  return (
    <AppShell initialProfile={initialProfile} initialWorkspaces={initialWorkspaces}>
      {children}
    </AppShell>
  );
}
