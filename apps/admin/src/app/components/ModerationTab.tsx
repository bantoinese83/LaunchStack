'use client';

import { useEffect, useState } from 'react';
import { Button, Card, EmptyState } from '@template/ui';
import type { FeedbackPost } from '@template/types';
import { adminFetch } from '@/lib/admin-fetch';

export function ModerationTab() {
  const [posts, setPosts] = useState<FeedbackPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await adminFetch('/api/admin/moderation');
        if (!response.ok) throw new Error('Could not load flagged posts');
        const payload = (await response.json()) as { posts: FeedbackPost[] };
        if (!cancelled) setPosts(payload.posts);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Load failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolve = async (postId: string, flagged: boolean) => {
    const response = await adminFetch('/api/admin/moderation', {
      method: 'POST',
      body: JSON.stringify({ postId, flagged }),
    });
    if (!response.ok) {
      setError('Could not update post');
      return;
    }
    const list = await adminFetch('/api/admin/moderation');
    if (list.ok) {
      const payload = (await list.json()) as { posts: FeedbackPost[] };
      setPosts(payload.posts);
    }
  };

  return (
    <Card className="space-y-5 animate-[rise_350ms_ease-out]">
      <div>
        <p className="type-eyebrow text-accent">Trust & safety</p>
        <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-ink">
          Flagged feedback
        </h3>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {(posts ?? []).length === 0 ? (
        <EmptyState
          title="Moderation queue empty"
          description="No flagged feedback posts need review right now."
        />
      ) : (
        <div className="space-y-3">
          {(posts ?? []).map((post) => (
            <div key={post.id} className="rounded-xl border border-line p-4">
              <p className="font-medium text-ink">{post.title}</p>
              <p className="mt-1 text-sm text-muted">{post.description}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void resolve(post.id, false)}>
                  Clear flag
                </Button>
                <Button variant="danger" size="sm" onClick={() => void resolve(post.id, true)}>
                  Keep flagged
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
