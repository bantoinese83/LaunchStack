import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NextResponse } from 'next/server';

const sendWelcomeEmail = vi.fn();

vi.mock('@/lib/api/route-auth', () => ({
  requireAuthenticatedUser: vi.fn(),
  routeErrorResponse: vi.fn((err: unknown) =>
    NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  ),
}));

vi.mock('@template/email', () => ({
  BrevoEmailService: class MockBrevoEmailService {
    sendWelcomeEmail = sendWelcomeEmail;
  },
}));

import { requireAuthenticatedUser } from '@/lib/api/route-auth';
import { POST } from './route';

describe('POST /api/email/welcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 403 when recipient does not match authenticated user', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      user: { id: 'u1', email: 'owner@example.com' } as never,
    });

    const response = await POST(
      new Request('https://example.com/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'other@example.com', name: 'Other' }),
      })
    );

    expect(response.status).toBe(403);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  test('sends welcome email for the authenticated user address', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      user: { id: 'u1', email: 'owner@example.com' } as never,
    });
    sendWelcomeEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });

    const response = await POST(
      new Request('https://example.com/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'owner@example.com', name: 'Owner' }),
      })
    );

    expect(response.status).toBe(200);
    expect(sendWelcomeEmail).toHaveBeenCalledWith('owner@example.com', 'Owner');
    await expect(response.json()).resolves.toEqual({ ok: true, messageId: 'msg-123' });
  });
});
