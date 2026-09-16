import { Profile } from './user';

export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'improvement'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = [
  'under_review',
  'planned',
  'in_progress',
  'completed',
  'declined',
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface FeedbackPost {
  id: string;
  workspace_id: string;
  author_id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  upvotes_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  user_has_voted?: boolean;
}

export interface FeedbackVote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
