import React from 'react';
import { StatsCard } from '@template/ui';
import { WorkspaceMember } from '@template/types';
import { getPlanLimits } from '@template/feature-flags';
import { motion, Variants } from 'framer-motion';

interface DashboardStatsProps {
  members: WorkspaceMember[];
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

export function DashboardStats({ members }: DashboardStatsProps) {
  const planLimits = getPlanLimits('active');
  const seatCount = members.length || 1;
  const seatsRemainingPct = Math.max(
    0,
    Math.round(((planLimits.maxMembers - seatCount) / planLimits.maxMembers) * 100)
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
    >
      <motion.div variants={item}>
        <StatsCard
          title="Team Seat Usage"
          value={`${seatCount} / ${planLimits.maxMembers}`}
          change={`${seatsRemainingPct}% free`}
          isPositive={true}
          subtext={`Pro tier allows up to ${planLimits.maxMembers} seats`}
        />
      </motion.div>
      <motion.div variants={item}>
        <StatsCard
          title="Roadmap Feedback"
          value="18"
          change="+5 this week"
          isPositive={true}
          subtext="5 items marked as Planned"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatsCard
          title="Stripe Subscription"
          value="$49 / mo"
          change="Active"
          isPositive={true}
          subtext="Next invoice on Aug 30, 2026"
        />
      </motion.div>
    </motion.div>
  );
}
