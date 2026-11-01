import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  recordReferral: vi.fn(),
  listForStudio: vi.fn(),
  countForReferrer: vi.fn(),
  countPendingForReferrer: vi.fn(),
  dashboardForMonth: vi.fn(),
  resolveReferrerUserIdByCode: vi.fn(),
  requireStudioManager: vi.fn(async (): Promise<Response | null> => null),
  from: vi.fn(),
}));

vi.mock('@template/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/api')>();
  return {
    ...actual,
    createSupabaseAdminClient: vi.fn(() => ({
      from: mocks.from,
    })),
    MysticReferralService: class {
      recordReferral = mocks.recordReferral;
      listForStudio = mocks.listForStudio;
      countForReferrer = mocks.countForReferrer;
      countPendingForReferrer = mocks.countPendingForReferrer;
      dashboardForMonth = mocks.dashboardForMonth;
    },
  };
});

vi.mock('@/lib/api/route-auth', () => ({
  requireAuthenticatedUser: vi.fn(async () => ({
    user: { id: '00000000-0000-0000-0000-000000000002' },
  })),
  routeErrorResponse: vi.fn(
    (_err: unknown, tag: string) => new Response(JSON.stringify({ error: tag }), { status: 500 })
  ),
}));

vi.mock('@/lib/mystic/studio-auth', () => ({
  requireStudioManager: mocks.requireStudioManager,
}));

vi.mock('@/lib/mystic/referrals', () => ({
  resolveReferrerUserIdByCode: mocks.resolveReferrerUserIdByCode,
}));

import { GET, POST } from './route';

const workspaceId = '33333333-3333-3333-3333-333333333333';

describe('GET /api/mystic/referrals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudioManager.mockResolvedValue(null);
    mocks.dashboardForMonth.mockResolvedValue({
      month: '2026-10',
      referrers: [{ referrerUserId: 'u1', name: 'Ada', total: 2, pending: 2, credited: 0 }],
      recent: [],
    });
  });

  test('returns dashboard for studio managers', async () => {
    const res = await GET(
      new Request(
        `http://localhost/api/mystic/referrals?workspaceId=${workspaceId}&view=dashboard&month=2026-10`
      )
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dashboard.referrers).toHaveLength(1);
    expect(mocks.dashboardForMonth).toHaveBeenCalledWith(workspaceId, '2026-10');
  });

  test('rejects missing workspaceId', async () => {
    const res = await GET(new Request('http://localhost/api/mystic/referrals'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/mystic/referrals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudioManager.mockResolvedValue(null);
    mocks.resolveReferrerUserIdByCode.mockResolvedValue('00000000-0000-0000-0000-000000000001');
    mocks.recordReferral.mockResolvedValue({ id: 'ref-1' });
    mocks.countPendingForReferrer.mockResolvedValue(3);
    mocks.countForReferrer.mockResolvedValue(3);
    mocks.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { referral_reward_after: 5 }, error: null }),
        }),
      }),
    }));
  });

  test('records a referral by code and returns progress', async () => {
    const res = await POST(
      new Request('http://localhost/api/mystic/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          referrerCode: 'MYSTICADMIN',
          referredName: 'Jordan Lee',
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.referral.id).toBe('ref-1');
    expect(body.untilReward).toBe(2);
    expect(body.pendingTowardReward).toBe(3);
    expect(mocks.recordReferral).toHaveBeenCalledWith(
      expect.objectContaining({
        referrerUserId: '00000000-0000-0000-0000-000000000001',
        referredName: 'Jordan Lee',
      })
    );
  });

  test('returns 404 when referrer code is unknown', async () => {
    mocks.resolveReferrerUserIdByCode.mockResolvedValue(null);
    const res = await POST(
      new Request('http://localhost/api/mystic/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          referrerCode: 'NOPE',
          referredName: 'Jordan Lee',
        }),
      })
    );
    expect(res.status).toBe(404);
  });

  test('requires studio manager', async () => {
    mocks.requireStudioManager.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    );
    const res = await POST(
      new Request('http://localhost/api/mystic/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          referrerCode: 'MYSTICADMIN',
          referredName: 'Jordan Lee',
        }),
      })
    );
    expect(res.status).toBe(403);
  });
});
