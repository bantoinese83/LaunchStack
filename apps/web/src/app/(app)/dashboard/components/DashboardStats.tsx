import React from 'react';
import { Skeleton, StatsCard } from '@template/ui';
import { Subscription, WorkspaceMember } from '@template/types';
import { getPlanLimits } from '@template/feature-flags';
import { formatSubscriptionLabel } from '@/lib/billing/format-subscription-label';
import { motion, Variants } from 'framer-motion';

interface DashboardStatsProps {
  members: WorkspaceMember[];
  feedbackCount: number;
  subscription: Subscription | null;
  planOverride?: 'free' | 'pro' | 'enterprise' | null;
  isLoading?: boolean;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
};

export function DashboardStats({
  members,
  feedbackCount,
  subscription,
  planOverride = null,
  isLoading = false,
}: DashboardStatsProps) {
  const planLimits = getPlanLimits(
    subscription?.status,
    subscription?.stripe_price_id,
    planOverride
  );
  const seatCount = members.length || 1;
  const seatsRemainingPct = Math.max(
    0,
    Math.round(((planLimits.maxMembers - seatCount) / planLimits.maxMembers) * 100)
  );
  const billing = formatSubscriptionLabel(subscription);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
    >
      <motion.div variants={item}>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <StatsCard
            title="Team Seat Usage"
            value={`${seatCount} / ${planLimits.maxMembers}`}
            change={`${seatsRemainingPct}% free`}
            isPositive={true}
            subtext={`Pro tier allows up to ${planLimits.maxMembers} seats`}
          />
        )}
      </motion.div>
      <motion.div variants={item}>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <StatsCard
            title="Roadmap Feedback"
            value={String(feedbackCount)}
            change={feedbackCount === 1 ? '1 post' : `${feedbackCount} posts`}
            isPositive={feedbackCount > 0}
            subtext="Posts in this workspace feedback board"
          />
        )}
      </motion.div>
      <motion.div variants={item}>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <StatsCard
            title="Stripe Subscription"
            value={billing.value}
            change={billing.change}
            isPositive={subscription?.status === 'active' || subscription?.status === 'trialing'}
            subtext={billing.subtext}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
