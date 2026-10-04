import {
  FeedbackService,
  ProfileService,
  SubscriptionService,
  WorkspaceService,
} from '@template/api';
import type { Profile, Subscription, Workspace, WorkspaceMember } from '@template/types';
import { getVerifiedServerUser } from '@/lib/supabase/server';

export type AppBootstrap = {
  userId: string;
  profile: Profile | null;
  workspaces: Workspace[];
};

export type DashboardBootstrap = AppBootstrap & {
  selectedWorkspace: Workspace | null;
  members: WorkspaceMember[];
  feedbackCount: number;
  subscription: Subscription | null;
};

export async function loadAppBootstrap(): Promise<AppBootstrap | null> {
  const { supabase, userId } = await getVerifiedServerUser();
  if (!userId) return null;
  const [workspaces, profile] = await Promise.all([
    new WorkspaceService(supabase).getUserWorkspaces(userId),
    new ProfileService(supabase).getProfile(userId),
  ]);
  return { userId, profile, workspaces };
}

export async function loadDashboardBootstrap(): Promise<DashboardBootstrap | null> {
  const bootstrap = await loadAppBootstrap();
  if (!bootstrap) return null;
  const selectedWorkspace = bootstrap.workspaces[0] ?? null;
  if (!selectedWorkspace) {
    return {
      ...bootstrap,
      selectedWorkspace: null,
      members: [],
      feedbackCount: 0,
      subscription: null,
    };
  }
  const { supabase } = await getVerifiedServerUser();
  const [members, feedback, subscription] = await Promise.all([
    new WorkspaceService(supabase).getWorkspaceMembers(selectedWorkspace.id),
    new FeedbackService(supabase).getWorkspaceFeedback(selectedWorkspace.id),
    new SubscriptionService(supabase).getWorkspaceSubscription(selectedWorkspace.id),
  ]);
  return {
    ...bootstrap,
    selectedWorkspace,
    members,
    feedbackCount: feedback.length,
    subscription,
  };
}
