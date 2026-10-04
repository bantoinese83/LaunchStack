import type { Subscription } from '@template/types';

export function formatSubscriptionLabel(subscription: Subscription | null): {
  value: string;
  change: string;
  subtext: string;
} {
  if (!subscription) {
    return {
      value: 'Not subscribed',
      change: 'Inactive',
      subtext: 'Start checkout to enable billing',
    };
  }

  const renewal = new Date(subscription.current_period_end).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    value: subscription.status.replaceAll('_', ' '),
    change: subscription.cancel_at_period_end ? 'Canceling' : 'Active',
    subtext: `Current period ends ${renewal}`,
  };
}
