import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, FeedbackService, WorkspaceService } from '@template/api';
import { FeedbackPost, FeedbackCategory } from '@template/types';
import { analytics } from '@template/analytics';

export function useFeedbackData() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const workspaceService = new WorkspaceService(supabase);
        const userWorkspaces = await workspaceService.getUserWorkspaces(session.user.id);

        if (userWorkspaces.length > 0) {
          const wsId = userWorkspaces[0].id;
          setSelectedWorkspaceId(wsId);
          const feedbackService = new FeedbackService(supabase);
          const feedbackPosts = await feedbackService.getWorkspaceFeedback(wsId);
          setPosts(feedbackPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeedback();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpvote = async (postId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const feedbackService = new FeedbackService(supabase);
      await feedbackService.upvoteFeedback(postId, session.user.id);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes_count: p.upvotes_count + 1 } : p))
      );

      showToast('Upvote recorded');
      analytics.track(
        { name: 'feedback_upvoted', properties: { post_id: postId } },
        session.user.id
      );
    } catch {
      showToast('You have already upvoted this item');
    }
  };

  const handleCreateFeedback = async (
    title: string,
    description: string,
    category: FeedbackCategory
  ) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const feedbackService = new FeedbackService(supabase);
    const newPost = await feedbackService.createFeedbackPost(
      selectedWorkspaceId,
      session.user.id,
      title,
      description,
      category
    );

    setPosts((prev) => [newPost, ...prev]);
    showToast('Feedback submitted to roadmap');

    analytics.track(
      {
        name: 'feedback_submitted',
        properties: { workspace_id: selectedWorkspaceId, post_id: newPost.id, category },
      },
      session.user.id
    );

    return newPost;
  };

  return {
    posts,
    selectedWorkspaceId,
    isLoading,
    toastMessage,
    setToastMessage,
    handleUpvote,
    handleCreateFeedback,
  };
}
