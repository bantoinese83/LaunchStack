import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listClientsForStudio: vi.fn(),
  listForWorkspace: vi.fn(),
  listForUser: vi.fn(),
}));

vi.mock('@template/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/api')>();
  return {
    ...actual,
    createSupabaseAdminClient: vi.fn(() => ({})),
    MysticCreditsService: class {
      listClientsForStudio = mocks.listClientsForStudio;
      listForWorkspace = mocks.listForWorkspace;
      listForUser = mocks.listForUser;
    },
  };
});

vi.mock('@/lib/api/route-auth', () => ({
  requireAuthenticatedUser: vi.fn(async () => ({ user: { id: 'user-1' } })),
  routeErrorResponse: vi.fn(
    (_err: unknown, tag: string) => new Response(JSON.stringify({ error: tag }), { status: 500 })
  ),
}));

vi.mock('@/lib/mystic/studio-auth', () => ({
  requireStudioManager: vi.fn(async () => null),
}));

import { GET } from './route';

const clients = [
  {
    user_id: 'u1',
    phone: '3125550100',
    referral_code: 'ABC123',
    full_name: 'Ada',
    email: 'ada@example.com',
    avatar_url: null,
  },
  {
    user_id: 'u2',
    phone: null,
    referral_code: null,
    full_name: 'Bo',
    email: 'bo@example.com',
    avatar_url: null,
  },
];

const creditRows = [
  {
    id: 'c1',
    user_id: 'u1',
    source_kind: 'membership',
    source_id: 'sub_1',
    blowouts_remaining: 2,
    expires_at: null,
  },
  {
    id: 'c2',
    user_id: 'u1',
    source_kind: 'package',
    source_id: 'pkg_1',
    blowouts_remaining: 1,
    expires_at: null,
  },
];

function request(extraQuery = '') {
  return new Request(`https://mystic.test/api/mystic/clients?workspaceId=ws-1${extraQuery}`);
}

describe('GET /api/mystic/clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listClientsForStudio.mockResolvedValue(clients);
    mocks.listForWorkspace.mockResolvedValue(creditRows);
  });

  test('enriches clients with credits using one workspace query, not one per client', async () => {
    const body = await (await GET(request('&credits=1'))).json();

    expect(mocks.listClientsForStudio).toHaveBeenCalledWith('ws-1');
    // The old implementation fired listForUser once per client (up to 500 queries).
    expect(mocks.listForUser).not.toHaveBeenCalled();
    expect(mocks.listForWorkspace).toHaveBeenCalledTimes(1);
    expect(mocks.listForWorkspace).toHaveBeenCalledWith('ws-1');

    expect(body.clients[0].credits.map((c: { id: string }) => c.id)).toEqual(['c1', 'c2']);
    expect(body.clients[1].credits).toEqual([]);
  });

  test('skips the credits query entirely unless the caller opts in', async () => {
    const body = await (await GET(request())).json();

    expect(mocks.listForWorkspace).not.toHaveBeenCalled();
    expect(mocks.listForUser).not.toHaveBeenCalled();
    expect(body.clients[0].credits).toEqual([]);
    expect(body.clients).toHaveLength(2);
  });

  test('does not run the credits query for an empty workspace', async () => {
    mocks.listClientsForStudio.mockResolvedValue([]);
    const body = await (await GET(request('&credits=1'))).json();

    expect(mocks.listForWorkspace).not.toHaveBeenCalled();
    expect(body.clients).toEqual([]);
  });
});
