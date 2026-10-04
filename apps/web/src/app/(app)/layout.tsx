import { loadAppBootstrap } from '@/lib/app/load-bootstrap';
import { AppLayoutClient } from './AppLayoutClient';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const bootstrap = await loadAppBootstrap();
  return (
    <AppLayoutClient
      initialProfile={bootstrap?.profile ?? null}
      initialWorkspaces={bootstrap?.workspaces ?? []}
    >
      {children}
    </AppLayoutClient>
  );
}
