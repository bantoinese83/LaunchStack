import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  capture: vi.fn(async () => ({ id: 'pi_1' })),
  markNoShow: vi.fn(async () => ({})),
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: () => ({ paymentIntents: { capture: mocks.capture } }),
}));

vi.mock('@template/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/api')>();
  return {
    ...actual,
    MysticAppointmentService: class {
      markNoShow = mocks.markNoShow;
    },
  };
});

import { captureAppointmentDeposit } from './capture-deposit';

function adminWith(row: Record<string, unknown> | null): SupabaseClient {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.single = () => Promise.resolve({ data: row, error: null });
  return { from: () => chain } as unknown as SupabaseClient;
}

const WITH_INTENT = {
  stripe_payment_intent_id: 'pi_123',
  deposit_cents: 2500,
  deposit_captured: false,
};

describe('captureAppointmentDeposit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_placeholder');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('captures the deposit and records it when a payment intent exists', async () => {
    const result = await captureAppointmentDeposit(adminWith(WITH_INTENT), 'a1');

    expect(mocks.capture).toHaveBeenCalledWith('pi_123', { amount_to_capture: 2500 });
    expect(mocks.markNoShow).toHaveBeenCalledWith('a1', { depositCaptured: true });
    expect(result.captured).toBe(true);
  });

  test('does not claim a deposit when there is no payment intent', async () => {
    const result = await captureAppointmentDeposit(
      adminWith({ ...WITH_INTENT, stripe_payment_intent_id: null }),
      'a2'
    );

    expect(mocks.capture).not.toHaveBeenCalled();
    // The old code always wrote deposit_captured: true here.
    expect(mocks.markNoShow).toHaveBeenCalledWith('a2', { depositCaptured: false });
    expect(result.captured).toBe(false);
  });

  test('does not claim a deposit when the deposit is zero', async () => {
    const result = await captureAppointmentDeposit(
      adminWith({ ...WITH_INTENT, deposit_cents: 0 }),
      'a3'
    );

    expect(mocks.capture).not.toHaveBeenCalled();
    expect(mocks.markNoShow).toHaveBeenCalledWith('a3', { depositCaptured: false });
    expect(result.captured).toBe(false);
  });

  test('does not re-capture an already captured deposit', async () => {
    const result = await captureAppointmentDeposit(
      adminWith({ ...WITH_INTENT, deposit_captured: true }),
      'a4'
    );

    expect(mocks.capture).not.toHaveBeenCalled();
    expect(result.captured).toBe(false);
  });

  test('still records the no-show when Stripe is not configured', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    const result = await captureAppointmentDeposit(adminWith(WITH_INTENT), 'a5');

    expect(mocks.capture).not.toHaveBeenCalled();
    expect(mocks.markNoShow).toHaveBeenCalledWith('a5', { depositCaptured: false });
    expect(result.captured).toBe(false);
  });

  test('throws for an unknown appointment', async () => {
    await expect(captureAppointmentDeposit(adminWith(null), 'missing')).rejects.toThrow(
      'Appointment not found'
    );
  });
});
