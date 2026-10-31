import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticCreditsService, groupCreditsByUserId } from '../MysticCreditsService';

const rows = [
  {
    id: 'c1',
    user_id: 'u1',
    source_kind: 'membership',
    source_id: 'sub_1',
    blowouts_remaining: 2,
    expires_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    user_id: 'u2',
    source_kind: 'package',
    source_id: 'pkg_1',
    blowouts_remaining: 1,
    expires_at: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'c3',
    user_id: 'u1',
    source_kind: 'package',
    source_id: 'pkg_2',
    blowouts_remaining: 3,
    expires_at: '2026-10-01T00:00:00.000Z',
  },
];

/** Minimal PostgREST query-builder stub that records how it was called. */
function makeSupabaseMock(result: { data: unknown; error: unknown }) {
  const order = vi.fn().mockResolvedValue(result);
  const gt = vi.fn().mockReturnValue({ order });
  const eq = vi.fn().mockReturnValue({ gt });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { supabase: { from } as unknown as SupabaseClient, from, select, eq, gt, order };
}

describe('groupCreditsByUserId', () => {
  it('groups rows by user and preserves query order inside each group', () => {
    const grouped = groupCreditsByUserId(rows);

    expect(Object.keys(grouped)).toEqual(['u1', 'u2']);
    expect(grouped.u1.map((r) => r.id)).toEqual(['c1', 'c3']);
    expect(grouped.u2.map((r) => r.id)).toEqual(['c2']);
  });

  it('returns an empty record for no rows and never invents keys', () => {
    expect(groupCreditsByUserId([])).toEqual({});
    expect(groupCreditsByUserId(rows).u3).toBeUndefined();
  });
});

describe('MysticCreditsService.listForWorkspace', () => {
  let mock: ReturnType<typeof makeSupabaseMock>;

  beforeEach(() => {
    mock = makeSupabaseMock({ data: rows, error: null });
  });

  it('fetches every workspace credit in ONE query (no per-user N+1)', async () => {
    const result = await new MysticCreditsService(mock.supabase).listForWorkspace('ws-1');

    expect(mock.from).toHaveBeenCalledTimes(1);
    expect(mock.from).toHaveBeenCalledWith('mystic_client_credits');
    expect(mock.eq).toHaveBeenCalledWith('workspace_id', 'ws-1');
    expect(mock.gt).toHaveBeenCalledWith('blowouts_remaining', 0);
    expect(result).toEqual(rows);
  });

  it('does not narrow by user_id — that is the whole point of the batched read', async () => {
    await new MysticCreditsService(mock.supabase).listForWorkspace('ws-1');

    expect(mock.eq).not.toHaveBeenCalledWith('user_id', expect.anything());
  });

  it('returns an empty array when the workspace has no active credits', async () => {
    const empty = makeSupabaseMock({ data: null, error: null });
    const result = await new MysticCreditsService(empty.supabase).listForWorkspace('ws-1');

    expect(result).toEqual([]);
  });

  it('throws when the query fails', async () => {
    const failing = makeSupabaseMock({ data: null, error: new Error('boom') });

    await expect(
      new MysticCreditsService(failing.supabase).listForWorkspace('ws-1')
    ).rejects.toThrow('boom');
  });
});
