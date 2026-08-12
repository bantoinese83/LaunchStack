'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Modal, Input, Avatar } from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import { FeedbackPost, Workspace } from '@template/types';
import { createFeedbackSchema } from '@template/validation';
import { ThumbsUp, Plus, ArrowLeft, Search, Check, Sparkles, Filter } from 'lucide-react';
import { analytics } from '@template/analytics';

export default function FeedbackBoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'improvement'>('feature');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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
        setWorkspaces(userWorkspaces);

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
    } catch (err: any) {
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
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-4 w-4" /> {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Feedback & Roadmap</h1>
            <p className="text-slate-400 text-sm mt-1">
              Submit ideas, upvote features, and track status updates.
            </p>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Submit Idea
          </Button>
        </div>

        {/* SEARCH AND CATEGORY FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            {['all', 'feature', 'improvement', 'bug'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEEDBACK POSTS LIST */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading roadmap items...</div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-400">No feedback items match your current filter.</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowModal(true)}>
              Be the first to submit feedback
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="flex items-start justify-between p-6 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex flex-col items-center justify-center h-14 w-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-blue-400 transition-all active:scale-95 shadow-inner"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs font-bold mt-1">{post.upvotes_count}</span>
                  </button>

                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{post.title}</h3>
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
                    <p className="text-slate-400 text-sm leading-relaxed">{post.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="default" className="text-[10px]">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL FOR NEW FEEDBACK */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Submit New Idea or Bug"
          description="Contribute to the public product roadmap."
        >
          {error && <div className="mb-4 text-xs text-red-400">{error}</div>}

          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Export roadmap items to CSV"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              >
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context and why this feature is valuable..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
