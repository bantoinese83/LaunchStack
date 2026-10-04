import { afterEach, describe, expect, test, vi } from 'vitest';
import type Stripe from 'stripe';
import {
  mustVerifyStripeWebhookSignature,
  resolveStripeExpandableId,
  subscriptionCurrentPeriodEndIso,
  subscriptionSyncPayload,
} from './stripe';

describe('resolveStripeExpandableId', () => {
  test('returns string ids as-is', () => {
    expect(resolveStripeExpandableId('sub_123')).toBe('sub_123');
  });

  test('extracts id from expanded objects', () => {
    expect(resolveStripeExpandableId({ id: 'sub_456' })).toBe('sub_456');
  });

  test('returns null for missing values', () => {
    expect(resolveStripeExpandableId(null)).toBeNull();
    expect(resolveStripeExpandableId(undefined)).toBeNull();
  });
});

describe('subscriptionCurrentPeriodEndIso', () => {
  test('converts unix period end to ISO string', () => {
    const subscription = {
      id: 'sub_test',
      items: { data: [{ current_period_end: 1_700_000_000 }] },
    } as Stripe.Subscription;

    expect(subscriptionCurrentPeriodEndIso(subscription)).toBe(
      new Date(1_700_000_000 * 1000).toISOString()
    );
  });

  test('throws when period end is missing', () => {
    const subscription = { id: 'sub_empty', items: { data: [{}] } } as Stripe.Subscription;
    expect(() => subscriptionCurrentPeriodEndIso(subscription)).toThrow(
      /missing current_period_end/
    );
  });
});

describe('subscriptionSyncPayload', () => {
  test('maps subscription fields for persistence', () => {
    const subscription = {
      id: 'sub_sync',
      status: 'active',
      cancel_at_period_end: false,
      items: { data: [{ current_period_end: 1_700_000_000 }] },
    } as Stripe.Subscription;

    expect(subscriptionSyncPayload(subscription)).toEqual({
      status: 'active',
      current_period_end: new Date(1_700_000_000 * 1000).toISOString(),
      cancel_at_period_end: false,
    });
  });
});

describe('mustVerifyStripeWebhookSignature', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('always verifies in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(mustVerifyStripeWebhookSignature(undefined)).toBe(true);
    expect(mustVerifyStripeWebhookSignature('whsec_mock')).toBe(true);
  });

  test('skips verification only for missing or mock secrets outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(mustVerifyStripeWebhookSignature(undefined)).toBe(false);
    expect(mustVerifyStripeWebhookSignature('whsec_mock')).toBe(false);
    expect(mustVerifyStripeWebhookSignature('whsec_real')).toBe(true);
  });
});
