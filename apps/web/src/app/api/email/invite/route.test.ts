import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NextResponse } from 'next/server';

const sendWorkspaceInvite = vi.fn();
const membershipSingle = vi.fn();

vi.mock('@/lib/api/route-auth', () => ({
  requireAuthenticatedUser: vi.fn(),
  routeErrorResponse: vi.fn((err: unknown) =>
    NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  ),
}));

vi.mock('@template/api', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: membershipSingle,
          })),
        })),
      })),
    })),
  })),
}));

vi.mock('@template/email', () => ({
  BrevoEmailService: class MockBrevoEmailService {
    sendWorkspaceInvite = sendWorkspaceInvite;
  },
}));

import { requireAuthenticatedUser } from '@/lib/api/route-auth';
import { POST } from './route';

const WORKSPACE_ID = '11111111-1111-4111-8111-111111111111';
const INVITE_BODY = {
  to: 'colleague@example.com',
  workspaceId: WORKSPACE_ID,
  inviterName: 'Owner',
  workspaceName: 'Acme',
  inviteUrl: 'https://app.example.com/login?invite=abc',
};

describe('POST /api/email/invite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 401 when user is not authenticated', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const response = await POST(
      new Request('https://example.com/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INVITE_BODY),
      })
    );

    expect(response.status).toBe(401);
    expect(sendWorkspaceInvite).not.toHaveBeenCalled();
  });

  test('returns 400 for invalid payload', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      user: { id: 'user-1' } as never,
    });

    const response = await POST(
      new Request('https://example.com/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...INVITE_BODY, inviteUrl: 'http://insecure.example.com' }),
      })
    );

    expect(response.status).toBe(400);
    expect(sendWorkspaceInvite).not.toHaveBeenCalled();
  });

  test('returns 403 when caller is not workspace admin or owner', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      user: { id: 'user-1' } as never,
    });
    membershipSingle.mockResolvedValue({ data: { role: 'workspace_member' }, error: null });

    const response = await POST(
      new Request('https://example.com/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INVITE_BODY),
      })
    );

    expect(response.status).toBe(403);
    expect(sendWorkspaceInvite).not.toHaveBeenCalled();
  });

  test('sends invite when caller is workspace admin', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      user: { id: 'user-1' } as never,
    });
    membershipSingle.mockResolvedValue({ data: { role: 'workspace_admin' }, error: null });
    sendWorkspaceInvite.mockResolvedValue({ success: true, messageId: 'msg-invite-1' });

    const response = await POST(
      new Request('https://example.com/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INVITE_BODY),
      })
    );

    expect(response.status).toBe(200);
    expect(sendWorkspaceInvite).toHaveBeenCalledWith(
      'colleague@example.com',
      'Owner',
      'Acme',
      INVITE_BODY.inviteUrl
    );
    await expect(response.json()).resolves.toEqual({ ok: true, messageId: 'msg-invite-1' });
  });
});
