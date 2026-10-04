import { describe, expect, test } from 'vitest';
import { formatSubscriptionLabel } from './format-subscription-label';

describe('formatSubscriptionLabel', () => {
  test('handles missing subscription', () => {
    expect(formatSubscriptionLabel(null).value).toBe('Not subscribed');
  });

  test('formats active subscription metadata', () => {
    const label = formatSubscriptionLabel({
      id: 'sub-1',
      workspace_id: 'ws-1',
      stripe_subscription_id: 'stripe-sub',
      stripe_price_id: 'price-1',
      status: 'active',
      current_period_end: '2026-08-30T00:00:00.000Z',
      cancel_at_period_end: false,
      created_at: '',
      updated_at: '',
    });

    expect(label.value).toBe('active');
    expect(label.change).toBe('Active');
    expect(label.subtext).toContain('Current period ends');
  });
});
