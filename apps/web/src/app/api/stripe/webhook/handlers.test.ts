import { beforeEach, describe, expect, test, vi } from 'vitest';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  recordReferral: vi.fn(async () => undefined),
  onConfirmed: vi.fn(async () => undefined),
  grantCredit: vi.fn(async () => ({})),
}));

vi.mock('@/lib/mystic/record-referral-on-confirm', () => ({
  recordReferralOnBookingConfirmed: mocks.recordReferral,
}));

vi.mock('@/lib/mystic/confirm-appointment', () => ({
  onMysticAppointmentConfirmed: mocks.onConfirmed,
}));

vi.mock('@template/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/api')>();
  return {
    ...actual,
    MysticCreditsService: class {
      grantCredit = mocks.grantCredit;
    },
  };
});

import { checkoutSessionCompleted } from './handlers';

/**
 * Chainable PostgREST stub that records the update payload and the filters applied,
 * so a test can assert the status guard and that no write is silently dropped.
 */
function makeAdmin(result: { data: unknown; error: unknown }) {
  const filters: [string, unknown][] = [];
  const updates: Record<string, unknown>[] = [];

  const chain: Record<string, unknown> = {};
  chain.update = (payload: Record<string, unknown>) => {
    updates.push(payload);
    return chain;
  };
  chain.eq = (col: string, val: unknown) => {
    filters.push([col, val]);
    return chain;
  };
  chain.in = (col: string, val: unknown) => {
    filters.push([col, val]);
    return chain;
  };
  chain.select = () => chain;
  chain.then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled);
  chain.catch = (onRejected: (error: unknown) => unknown) =>
    Promise.resolve(result).catch(onRejected);

  return {
    admin: { from: () => chain } as unknown as SupabaseClient,
    filters,
    updates,
  };
}

function bookingEvent(metadata: Record<string, string> = {}): Stripe.Event {
  return {
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        object: 'checkout.session',
        payment_intent: 'pi_123',
        metadata: {
          mystic_kind: 'booking',
          appointment_id: 'appt-1',
          client_user_id: 'user-1',
          workspace_id: 'ws-1',
          ...metadata,
        },
      },
    },
  } as unknown as Stripe.Event;
}

function preorderEvent(): Stripe.Event {
  return {
    id: 'evt_2',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_2',
        object: 'checkout.session',
        metadata: { mystic_kind: 'preorder', preorder_id: 'po-1' },
      },
    },
  } as unknown as Stripe.Event;
}

const stripe = {} as unknown as Stripe;

describe('checkoutSessionCompleted — booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('confirms a pending booking and runs the post-confirmation side effects', async () => {
    const { admin, updates, filters } = makeAdmin({ data: [{ id: 'appt-1' }], error: null });

    await checkoutSessionCompleted(bookingEvent(), stripe, admin);

    expect(updates[0]).toMatchObject({ status: 'confirmed', stripe_payment_intent_id: 'pi_123' });
    expect(filters).toContainEqual(['id', 'appt-1']);
    expect(mocks.onConfirmed).toHaveBeenCalledWith(admin, 'appt-1');
  });

  test('only confirms a booking that is still pending or confirmed', async () => {
    const { admin, filters } = makeAdmin({ data: [{ id: 'appt-1' }], error: null });

    await checkoutSessionCompleted(bookingEvent(), stripe, admin);

    // Without this guard a late webhook could resurrect a canceled / no_show visit
    // or drag an in-progress one back to 'confirmed'.
    expect(filters).toContainEqual(['status', ['pending', 'confirmed']]);
  });

  test('does not resurrect a canceled booking', async () => {
    const { admin } = makeAdmin({ data: [], error: null });

    await checkoutSessionCompleted(bookingEvent(), stripe, admin);

    // No confirmation email/SMS, no credit consumed, no referral credited.
    expect(mocks.onConfirmed).not.toHaveBeenCalled();
    expect(mocks.recordReferral).not.toHaveBeenCalled();
  });

  test('throws when the write fails so Stripe retries instead of losing the payment', async () => {
    const { admin } = makeAdmin({ data: null, error: new Error('db down') });

    await expect(checkoutSessionCompleted(bookingEvent(), stripe, admin)).rejects.toThrow(
      'db down'
    );
    expect(mocks.onConfirmed).not.toHaveBeenCalled();
  });

  test('credits the referral when the booking carries one', async () => {
    const { admin } = makeAdmin({ data: [{ id: 'appt-1' }], error: null });

    await checkoutSessionCompleted(bookingEvent({ referrer_user_id: 'ref-1' }), stripe, admin);

    expect(mocks.recordReferral).toHaveBeenCalledTimes(1);
  });
});

describe('checkoutSessionCompleted — preorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('marks a preorder paid but never resurrects a canceled one', async () => {
    const { admin, filters, updates } = makeAdmin({ data: null, error: null });

    await checkoutSessionCompleted(preorderEvent(), stripe, admin);

    expect(updates[0]).toMatchObject({ status: 'paid' });
    expect(filters).toContainEqual(['status', ['pending', 'paid']]);
  });
});
