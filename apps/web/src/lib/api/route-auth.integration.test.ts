import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('@template/api', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseAdminClient } from '@template/api';
import { requireAuthenticatedUser, routeErrorResponse } from './route-auth';

describe('requireAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 401 when Authorization header is missing', async () => {
    const result = await requireAuthenticatedUser(new Request('https://example.com'));
    expect(result.response?.status).toBe(401);
  });

  test('returns user when Supabase validates the token', async () => {
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'a@example.com' } },
          error: null,
        }),
      },
    } as unknown as SupabaseClient);

    const result = await requireAuthenticatedUser(
      new Request('https://example.com', {
        headers: { authorization: 'Bearer valid-token' },
      })
    );

    expect(result.user?.id).toBe('user-1');
  });
});

describe('routeErrorResponse', () => {
  test('returns JSON error payload with status 500', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = routeErrorResponse(new Error('boom'), '[Test Route]');
    errorSpy.mockRestore();
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'boom' });
  });
});
