'use client';

import { useEffect, useState } from 'react';
import { FeedbackService } from '@template/api';
import { FeedbackPost, FeedbackCategory } from '@template/types';
import { analytics } from '@template/analytics';
import { useToast } from '@/hooks/useToast';
import { getBrowserSupabaseClient, requireBrowserSession } from '@/lib/supabase/browser-session';
import { useAppWorkspace } from '../../context/AppWorkspaceContext';

export function useFeedbackData() {
  const { selectedWorkspace, isAppLoading, setPageDataLoading } = useAppWorkspace();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toastMessage, toastVariant, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (isAppLoading) {
      return;
    }
    const workspaceId = selectedWorkspace?.id;
    if (!workspaceId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setPageDataLoading(true);
      try {
        const feedbackService = new FeedbackService(getBrowserSupabaseClient());
        const feedbackPosts = await feedbackService.getWorkspaceFeedback(workspaceId);
        if (!cancelled) {
          setPosts(feedbackPosts);
        }
      } catch (err) {
        console.error('[Feedback] Failed to load posts', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setPageDataLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAppLoading, selectedWorkspace?.id, setPageDataLoading]);

  const handleUpvote = async (postId: string) => {
    try {
      const auth = await requireBrowserSession();
      if (!auth) return;

      const feedbackService = new FeedbackService(auth.supabase);
      await feedbackService.upvoteFeedback(postId, auth.user.id);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes_count: p.upvotes_count + 1 } : p))
      );

      showToast('Upvote recorded');
      analytics.track({ name: 'feedback_upvoted', properties: { post_id: postId } }, auth.user.id);
    } catch {
      showToast('You have already upvoted this item', 'error');
    }
  };

  const handleCreateFeedback = async (
    title: string,
    description: string,
    category: FeedbackCategory
  ) => {
    const workspaceId = selectedWorkspace?.id;
    if (!workspaceId) {
      throw new Error('No workspace selected');
    }

    const auth = await requireBrowserSession();
    if (!auth) throw new Error('Not authenticated');

    const feedbackService = new FeedbackService(auth.supabase);
    const newPost = await feedbackService.createFeedbackPost(
      workspaceId,
      auth.user.id,
      title,
      description,
      category
    );

    setPosts((prev) => [newPost, ...prev]);
    showToast('Feedback submitted to roadmap');

    analytics.track(
      {
        name: 'feedback_submitted',
        properties: { workspace_id: workspaceId, post_id: newPost.id, category },
      },
      auth.user.id
    );

    return newPost;
  };

  return {
    posts,
    selectedWorkspaceId: selectedWorkspace?.id ?? '',
    isLoading: isAppLoading || isLoading,
    toastMessage,
    toastVariant,
    dismissToast,
    handleUpvote,
    handleCreateFeedback,
  };
}
