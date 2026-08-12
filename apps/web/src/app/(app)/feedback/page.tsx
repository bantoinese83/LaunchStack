'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Modal, Input } from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import { FeedbackCategory, FeedbackPost, FEEDBACK_CATEGORIES } from '@template/types';
import { createFeedbackSchema } from '@template/validation';
import { ThumbsUp, Plus, ArrowLeft, Search, Check } from 'lucide-react';
import { analytics } from '@template/analytics';

const FEEDBACK_FILTERS = ['all', ...FEEDBACK_CATEGORIES] as const;
type FeedbackFilter = (typeof FEEDBACK_FILTERS)[number];

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  feature: 'Feature Request',
  improvement: 'Improvement',
  bug: 'Bug Report',
};

export default function FeedbackBoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [filterCategory, setFilterCategory] = useState<FeedbackFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
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

        const api = new DomainAPI(supabase);
        const userWorkspaces = await api.getUserWorkspaces(session.user.id);

        if (userWorkspaces.length > 0) {
          const wsId = userWorkspaces[0].id;
          setSelectedWorkspaceId(wsId);
          const feedbackPosts = await api.getWorkspaceFeedback(wsId);
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

      const api = new DomainAPI(supabase);
      await api.upvoteFeedback(postId, session.user.id);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes_count: p.upvotes_count + 1 } : p))
      );

      showToast('Upvote recorded!');
      analytics.track(
        { name: 'feedback_upvoted', properties: { post_id: postId } },
        session.user.id
      );
    } catch {
      showToast('You have already upvoted this item!');
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = createFeedbackSchema.safeParse({
      workspaceId: selectedWorkspaceId,
      title,
      description,
      category,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const api = new DomainAPI(supabase);
      const newPost = await api.createFeedbackPost(
        selectedWorkspaceId,
        session.user.id,
        title,
        description,
        category
      );

      setPosts((prev) => [newPost, ...prev]);
      setShowModal(false);
      setTitle('');
      setDescription('');
      showToast('Feedback submitted to roadmap!');

      analytics.track(
        {
          name: 'feedback_submitted',
          properties: { workspace_id: selectedWorkspaceId, post_id: newPost.id, category },
        },
        session.user.id
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-paper text-ink p-8">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-lg bg-accent-soft border border-accent/20 text-success px-4 py-3 text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-4 w-4" /> {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Customer Feedback & Roadmap</h1>
            <p className="text-muted text-sm mt-1">
              Submit ideas, upvote features, and track status updates.
            </p>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Submit Idea
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-surface p-4 rounded-md border border-line">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-paper border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            {FEEDBACK_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-accent text-ink shadow-sm'
                    : 'bg-paper text-muted border border-line hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted">Loading roadmap items...</div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted">No feedback items match your current filter.</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
              Be the first to submit feedback
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="flex items-start justify-between p-6 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex flex-col items-center justify-center h-14 w-12 rounded-md bg-paper border border-line hover:border-accent text-muted hover:text-accent transition-all active:scale-95 shadow-inner"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs font-semibold mt-1">{post.upvotes_count}</span>
                  </button>

                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-ink">{post.title}</h3>
                      <Badge
                        variant={
                          post.status === 'completed'
                            ? 'success'
                            : post.status === 'planned'
                              ? 'info'
                              : 'warning'
                        }
                      >
                        {post.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{post.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="default" className="text-[10px]">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Submit New Idea or Bug"
          description="Contribute to the public product roadmap."
        >
          {error && <div className="mb-4 text-xs text-danger">{error}</div>}

          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Export roadmap items to CSV"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-muted uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-muted uppercase">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context and why this feature is valuable..."
                className="w-full rounded-lg border border-line bg-paper p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit Idea
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
