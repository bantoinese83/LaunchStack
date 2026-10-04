import { redirect } from 'next/navigation';
import { loadDashboardBootstrap } from '@/lib/app/load-bootstrap';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const data = await loadDashboardBootstrap();
  if (!data) {
    redirect('/login?next=/dashboard');
  }
  if (data.workspaces.length === 0) {
    redirect('/onboarding');
  }
  return (
    <DashboardClient
      initialWorkspaceId={data.selectedWorkspace?.id ?? null}
      initialMembers={data.members}
      initialFeedbackCount={data.feedbackCount}
      initialSubscription={data.subscription}
    />
  );
}
