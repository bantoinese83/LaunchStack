import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { FeedbackPost } from '@template/types';
import { Button, Card, EmptyState, Badge } from '@template/ui';

interface FeedbackListProps {
  isLoading: boolean;
  posts: FeedbackPost[];
  onUpvote: (postId: string) => void;
  onShowModal: () => void;
}

export function FeedbackList({ isLoading, posts, onUpvote, onShowModal }: FeedbackListProps) {
  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted">Loading roadmap items…</div>;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No matching feedback"
        description="Try another filter, or be the first to submit an idea."
        action={
          <Button variant="outline" size="sm" onClick={onShowModal}>
            Submit idea
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="flex items-start justify-between p-5 transition-colors hover:border-ink/25"
        >
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => onUpvote(post.id)}
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
  );
}
