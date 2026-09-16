import React, { useState } from 'react';
import { FeedbackCategory, FEEDBACK_CATEGORIES } from '@template/types';
import { Alert, Button, Input, Modal, fieldSelectClassName } from '@template/ui';
import { createFeedbackSchema } from '@template/validation';

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  feature: 'Feature Request',
  improvement: 'Improvement',
  bug: 'Bug Report',
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSubmit: (title: string, description: string, category: FeedbackCategory) => Promise<any>;
}

export function FeedbackModal({ isOpen, onClose, workspaceId, onSubmit }: FeedbackModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onClose();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = createFeedbackSchema.safeParse({
      workspaceId,
      title,
      description,
      category,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(title, description, category);
      handleClose();
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit new idea or bug"
      description="Contribute to the public product roadmap."
    >
      {error && (
        <Alert className="mb-4" variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Submit idea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
