'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FeedbackService, SubscriptionService, WorkspaceService } from '@template/api';
import { WorkspaceMember, Subscription } from '@template/types';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-session';
import { useAppWorkspace } from '../../context/AppWorkspaceContext';

export function useDashboardData(initial?: {
  initialWorkspaceId?: string | null;
  initialMembers?: WorkspaceMember[];
  initialFeedbackCount?: number;
  initialSubscription?: Subscription | null;
}) {
  const {
    profile,
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    isAppLoading,
    wsName,
    setWsName,
    wsLogoUrl,
    setWsLogoUrl,
    updateWorkspaceSettings,
    setPageDataLoading,
  } = useAppWorkspace();

  const [members, setMembers] = useState<WorkspaceMember[]>(initial?.initialMembers ?? []);
  const [feedbackCount, setFeedbackCount] = useState(initial?.initialFeedbackCount ?? 0);
  const [subscription, setSubscription] = useState<Subscription | null>(
    initial?.initialSubscription ?? null
  );
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const skippedInitialFetchRef = useRef(false);

  const refreshWorkspaceContext = useCallback(
    async (workspaceId: string) => {
      setIsMembersLoading(true);
      setPageDataLoading(true);
      try {
        const supabase = getBrowserSupabaseClient();
        const workspaceService = new WorkspaceService(supabase);
        const feedbackService = new FeedbackService(supabase);
        const subscriptionService = new SubscriptionService(supabase);

        const [workspaceMembers, feedbackPosts, workspaceSubscription] = await Promise.all([
          workspaceService.getWorkspaceMembers(workspaceId),
          feedbackService.getWorkspaceFeedback(workspaceId),
          subscriptionService.getWorkspaceSubscription(workspaceId),
        ]);

        setMembers(workspaceMembers);
        setFeedbackCount(feedbackPosts.length);
        setSubscription(workspaceSubscription);
      } catch (err) {
        console.error('[Dashboard] Failed to load workspace context', err);
      } finally {
        setIsMembersLoading(false);
        setPageDataLoading(false);
      }
    },
    [setPageDataLoading]
  );

  useEffect(() => {
    const workspaceId = selectedWorkspace?.id;
    if (!workspaceId) {
      return;
    }

    const hasServerPayload =
      initial?.initialWorkspaceId != null && initial.initialMembers !== undefined;
    if (
      hasServerPayload &&
      !skippedInitialFetchRef.current &&
      workspaceId === initial.initialWorkspaceId
    ) {
      skippedInitialFetchRef.current = true;
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsMembersLoading(true);
      setPageDataLoading(true);
      try {
        const supabase = getBrowserSupabaseClient();
        const workspaceService = new WorkspaceService(supabase);
        const feedbackService = new FeedbackService(supabase);
        const subscriptionService = new SubscriptionService(supabase);

        const [workspaceMembers, feedbackPosts, workspaceSubscription] = await Promise.all([
          workspaceService.getWorkspaceMembers(workspaceId),
          feedbackService.getWorkspaceFeedback(workspaceId),
          subscriptionService.getWorkspaceSubscription(workspaceId),
        ]);

        if (cancelled) return;

        setMembers(workspaceMembers);
        setFeedbackCount(feedbackPosts.length);
        setSubscription(workspaceSubscription);
      } catch (err) {
        console.error('[Dashboard] Failed to load workspace context', err);
      } finally {
        if (!cancelled) {
          setIsMembersLoading(false);
          setPageDataLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    initial?.initialMembers,
    initial?.initialWorkspaceId,
    selectedWorkspace?.id,
    setPageDataLoading,
  ]);

  const saveWorkspaceSettings = useCallback(
    async (input: { name: string; logoUrl: string }) => {
      const logoUrl = input.logoUrl.trim() === '' ? null : input.logoUrl.trim();
      await updateWorkspaceSettings({ name: input.name, logoUrl });
    },
    [updateWorkspaceSettings]
  );

  return {
    profile,
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    members,
    feedbackCount,
    subscription,
    isLoading: isAppLoading,
    isMembersLoading,
    wsName,
    setWsName,
    wsLogoUrl,
    setWsLogoUrl,
    saveWorkspaceSettings,
    refreshMembers: () =>
      selectedWorkspace ? refreshWorkspaceContext(selectedWorkspace.id) : Promise.resolve(),
  };
}
