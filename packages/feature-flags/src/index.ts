import { FeatureFlag, SubscriptionStatus } from '@template/types';

export interface PlanLimits {
  maxMembers: number;
  maxFeedbackPosts: number;
  allowCustomDomain: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxMembers: 3,
    maxFeedbackPosts: 50,
    allowCustomDomain: false,
    prioritySupport: false,
  },
  pro: {
    maxMembers: 20,
    maxFeedbackPosts: 1000,
    allowCustomDomain: true,
    prioritySupport: true,
  },
  enterprise: {
    maxMembers: 999999,
    maxFeedbackPosts: 999999,
    allowCustomDomain: true,
    prioritySupport: true,
  },
};

export const getPlanLimits = (
  status?: SubscriptionStatus | null,
  priceId?: string | null
): PlanLimits => {
  if (status !== 'active' && status !== 'trialing') {
    return PLAN_LIMITS.free;
  }
  if (priceId?.includes('enterprise')) {
    return PLAN_LIMITS.enterprise;
  }
  return PLAN_LIMITS.pro;
};

export const isFeatureEnabled = (flag: FeatureFlag, workspaceId?: string): boolean => {
  if (flag.enabled_globally) return true;
  if (!workspaceId) return false;
  return flag.target_workspaces.includes(workspaceId);
};
