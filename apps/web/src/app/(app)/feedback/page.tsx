'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Toast,
  fieldSelectClassName,
} from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import { FeedbackCategory, FeedbackPost, FEEDBACK_CATEGORIES } from '@template/types';
import { createFeedbackSchema } from '@template/validation';
import { ThumbsUp, Plus, ArrowLeft, Search } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      showToast('Upvote recorded');
      analytics.track(
        { name: 'feedback_upvoted', properties: { post_id: postId } },
        session.user.id
      );
    } catch {
      showToast('You have already upvoted this item');
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
      setIsSubmitting(true);
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
      showToast('Feedback submitted to roadmap');

      analytics.track(
        {
          name: 'feedback_submitted',
          properties: { workspace_id: selectedWorkspaceId, post_id: newPost.id, category },
        },
        session.user.id
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-paper atlas-grain p-6 text-ink md:p-8">
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      <div className="mx-auto max-w-5xl animate-[rise_400ms_ease-out]">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Feedback & roadmap
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Submit ideas, upvote features, and track status updates.
            </p>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Submit idea
          </Button>
        </div>

        <div className="mb-6 flex flex-col items-stretch justify-between gap-4 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/65 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FEEDBACK_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-accent text-white'
                    : 'border border-line bg-paper text-muted hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted">Loading roadmap items…</div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            title="No matching feedback"
            description="Try another filter, or be the first to submit an idea."
            action={
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
                Submit idea
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="flex items-start justify-between p-5 transition-colors hover:border-ink/25"
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => handleUpvote(post.id)}
                    className="flex h-14 w-12 flex-col items-center justify-center rounded-md border border-line bg-paper text-muted transition-all hover:border-accent hover:text-accent active:scale-95"
                    aria-label={`Upvote ${post.title}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="mt-1 text-xs font-semibold">{post.upvotes_count}</span>
                  </button>

                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                        {post.title}
                      </h3>
                      <Badge
                        variant={
                          post.status === 'completed'
                            ? 'success'
                            : post.status === 'planned'
                              ? 'info'
                              : 'warning'
                        }
                      >
                        {post.status.replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">{post.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Badge variant="default">{post.category}</Badge>
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
          onClose={() => {
            setShowModal(false);
            setError(null);
          }}
          title="Submit new idea or bug"
          description="Contribute to the public product roadmap."
        >
          {error && (
            <Alert className="mb-4" variant="error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Export roadmap items to CSV"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className={fieldSelectClassName}
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context and why this is valuable…"
                className="w-full rounded-md border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/65 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Submit idea
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
