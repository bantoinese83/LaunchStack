import { afterEach, describe, expect, test, vi } from 'vitest';
import { parseStripeWebhookEvent } from './stripe-webhook';

describe('parseStripeWebhookEvent', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('parses JSON body when verification is skipped in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const body = JSON.stringify({ id: 'evt_1', type: 'ping', object: 'event' });
    const result = parseStripeWebhookEvent(
      body,
      null,
      undefined,
      (message, status) => new Response(message, { status })
    );

    expect(result.event?.id).toBe('evt_1');
    expect(result.errorResponse).toBeUndefined();
  });

  test('returns error when signature is required but missing', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const result = parseStripeWebhookEvent(
      '{}',
      null,
      'whsec_real',
      (message, status) => new Response(message, { status })
    );

    expect(result.event).toBeUndefined();
    expect(result.errorResponse?.status).toBe(400);
  });
});
