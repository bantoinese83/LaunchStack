import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  tables: [] as string[],
  requireStudioManager: vi.fn(async (): Promise<Response | null> => null),
}));

/**
 * Filter-aware PostgREST chain stub: builder methods narrow the row set, and the
 * chain itself is awaitable — so `.in()` and `.in().order()` both work.
 */
function makeChain(rows: Record<string, unknown>[]) {
  let filtered = rows;
  const settle = (onFulfilled: (v: { data: unknown; error: null }) => unknown) =>
    Promise.resolve({ data: filtered, error: null }).then(onFulfilled);

  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = (col: string, val: unknown) => {
    filtered = filtered.filter((r) => r[col] === val);
    return chain;
  };
  chain.in = (col: string, vals: unknown[]) => {
    const allowed = new Set(vals);
    filtered = filtered.filter((r) => allowed.has(r[col]));
    return chain;
  };
  chain.order = () => chain;
  chain.single = () => chain;
  chain.then = settle;
  chain.catch = (onRejected: (e: unknown) => unknown) =>
    Promise.resolve({ data: filtered, error: null }).catch(onRejected);
  return chain;
}

const A1 = '11111111-1111-4111-8111-111111111111';
const A2 = '22222222-2222-4222-8222-222222222222';
const A3 = '33333333-3333-4333-8333-333333333333';
const MISSING = '99999999-9999-4999-8999-999999999999';

const APPOINTMENTS = [
  { id: A1, client_user_id: 'client-1', workspace_id: 'ws-1' },
  { id: A2, client_user_id: 'client-2', workspace_id: 'ws-1' },
  { id: A3, client_user_id: 'client-3', workspace_id: 'ws-1' },
];

const PHOTOS = [
  {
    id: 'p1',
    appointment_id: A1,
    public_url: 'https://cdn/1.jpg',
    storage_path: 's1',
    created_at: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    appointment_id: A1,
    public_url: 'https://cdn/2.jpg',
    storage_path: 's2',
    created_at: '2026-08-02T00:00:00.000Z',
  },
  {
    id: 'p3',
    appointment_id: A3,
    public_url: 'https://cdn/3.jpg',
    storage_path: 's3',
    created_at: '2026-08-03T00:00:00.000Z',
  },
];

vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn() }));

vi.mock('@/lib/api/route-auth', () => ({
  requireAuthenticatedUser: vi.fn(async () => ({ user: { id: 'stylist-1' } })),
  routeErrorResponse: vi.fn(
    (_err: unknown, tag: string) => new Response(JSON.stringify({ error: tag }), { status: 500 })
  ),
}));

vi.mock('@/lib/mystic/studio-auth', () => ({
  requireStudioManager: mocks.requireStudioManager,
}));

vi.mock('@template/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/api')>();
  return {
    ...actual,
    createSupabaseAdminClient: () => ({
      from(table: string) {
        mocks.tables.push(table);
        return makeChain(table === 'mystic_appointments' ? APPOINTMENTS : PHOTOS);
      },
    }),
  };
});

import { GET } from './route';

const BATCH_URL = `https://mystic.test/api/mystic/appointments/inspo?appointmentIds=${A1},${A2},${A3}`;

describe('GET /api/mystic/appointments/inspo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tables.length = 0;
    mocks.requireStudioManager.mockResolvedValue(null);
  });

  test('batch read costs two queries for the whole board, not two per visit', async () => {
    const res = await GET(new Request(BATCH_URL));
    const body = await res.json();

    // 3 visits -> 2 queries total (appointments + photos), independent of board size.
    expect(mocks.tables).toEqual(['mystic_appointments', 'mystic_appointment_photos']);
    // One membership check for the single distinct workspace.
    expect(mocks.requireStudioManager).toHaveBeenCalledTimes(1);

    expect(body.photosByAppointment[A1].map((p: { id: string }) => p.id)).toEqual(['p1', 'p2']);
    expect(body.photosByAppointment[A2]).toEqual([]);
    expect(body.photosByAppointment[A3].map((p: { id: string }) => p.id)).toEqual(['p3']);
  });

  test('deduplicates repeated ids so they do not inflate the query', async () => {
    const res = await GET(
      new Request(
        `https://mystic.test/api/mystic/appointments/inspo?appointmentIds=${A1},${A1},${A1}`
      )
    );
    const body = await res.json();

    expect(mocks.tables).toEqual(['mystic_appointments', 'mystic_appointment_photos']);
    expect(body.photosByAppointment[A1].map((p: { id: string }) => p.id)).toEqual(['p1', 'p2']);
  });

  test('returns 403 when the caller cannot manage the workspace', async () => {
    mocks.requireStudioManager.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    );

    const res = await GET(new Request(BATCH_URL));

    expect(res.status).toBe(403);
    expect(mocks.tables).toEqual(['mystic_appointments']);
  });

  test('returns 404 when a requested visit does not exist', async () => {
    const res = await GET(
      new Request(
        `https://mystic.test/api/mystic/appointments/inspo?appointmentIds=${A1},${MISSING}`
      )
    );

    expect(res.status).toBe(404);
    expect(mocks.tables).toEqual(['mystic_appointments']);
  });

  test('keeps the single-appointment response shape for existing callers', async () => {
    const res = await GET(
      new Request(`https://mystic.test/api/mystic/appointments/inspo?appointmentId=${A1}`)
    );
    const body = await res.json();

    expect(body.photos.map((p: { id: string }) => p.id)).toEqual(['p1', 'p2']);
    expect(body.photosByAppointment).toBeUndefined();
  });
});
