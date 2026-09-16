import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@template/ui';

interface FeedbackHeaderProps {
  onShowModal: () => void;
}

export function FeedbackHeader({ onShowModal }: FeedbackHeaderProps) {
  return (
    <>
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

        <Button variant="primary" onClick={onShowModal} className="gap-2">
          <Plus className="h-4 w-4" /> Submit idea
        </Button>
      </div>
    </>
  );
}
