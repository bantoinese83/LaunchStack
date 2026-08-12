export const SYSTEM_ROLES = ['user', 'super_admin'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const WORKSPACE_ROLES = ['workspace_owner', 'workspace_admin', 'workspace_member'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Roles that can be assigned via invite (owners are created with the workspace). */
export const INVITABLE_WORKSPACE_ROLES = ['workspace_admin', 'workspace_member'] as const;
export type InvitableWorkspaceRole = (typeof INVITABLE_WORKSPACE_ROLES)[number];

export const SUBSCRIPTION_STATUSES = [
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

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

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: SubscriptionStatus;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface AuditLog {
  id: string;
  workspace_id: string | null;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile;
}

export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  enabled_globally: boolean;
  target_workspaces: string[];
  created_at: string;
}

export interface APIResult<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}
