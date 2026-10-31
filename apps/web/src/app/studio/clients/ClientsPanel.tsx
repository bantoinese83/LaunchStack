'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { StudioLoadingRows } from '@/components/mystic/studio/StudioLoadingRows';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import {
  mysticCard,
  mysticInput,
  mysticPageStack,
  mysticToolbarRow,
} from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Credit = {
  source_kind: string;
  source_id: string;
  blowouts_remaining: number;
  expires_at: string | null;
};

type Client = {
  user_id: string;
  phone: string | null;
  referral_code: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  credits: Credit[];
};

function creditLabel(c: Credit) {
  const kind =
    c.source_kind === 'membership'
      ? 'Membership'
      : c.source_kind === 'package'
        ? 'Package'
        : c.source_kind;
  const exp = c.expires_at ? ` · exp ${new Date(c.expires_at).toLocaleDateString()}` : '';
  return `${c.blowouts_remaining} blowout${c.blowouts_remaining === 1 ? '' : 's'} · ${kind}${exp}`;
}

export function ClientsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}&credits=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setClients(data.clients ?? []);
      })
      .catch(() => setError('Could not load clients'))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const hay = [c.full_name, c.email, c.phone, c.referral_code, c.user_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [clients, query]);

  async function copyCode(code: string, userId: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopyId(userId);
      window.setTimeout(() => setCopyId(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className={mysticPageStack}>
      <div className={`${mysticToolbarRow} flex-col sm:flex-row sm:items-center`}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone, referral code…"
          className={`${mysticInput} max-w-md`}
        />
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-sm text-accent underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading && clients.length === 0 ? <StudioLoadingRows count={4} /> : null}
      {!loading && clients.length === 0 && !error ? <MysticEmptyState variant="clients" /> : null}
      {!loading && clients.length > 0 && filtered.length === 0 ? (
        <p className="text-sm text-muted">No clients match “{query.trim()}”.</p>
      ) : null}
      {filtered.length > 0 ? (
        <ul className={`${mysticCard} divide-y divide-line/80 overflow-hidden p-0`}>
          {filtered.map((client) => (
            <li key={client.user_id} className="flex gap-3 p-4">
              {client.avatar_url ? (
                <Image
                  src={client.avatar_url}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-medium text-accent">
                  {(client.full_name ?? client.email ?? '?')[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-ink">
                    {client.full_name ?? client.email ?? `Client ${client.user_id.slice(0, 8)}`}
                  </p>
                  <Link
                    href={`/studio/messages?client=${client.user_id}`}
                    className="text-xs font-medium text-accent underline"
                  >
                    Message
                  </Link>
                </div>
                {client.email && client.full_name ? (
                  <p className="text-sm text-muted">{client.email}</p>
                ) : null}
                <p className="text-sm text-muted">{client.phone ?? 'No phone on file'}</p>
                {client.referral_code ? (
                  <button
                    type="button"
                    onClick={() => void copyCode(client.referral_code!, client.user_id)}
                    className="mt-1 font-mono text-xs text-accent underline"
                  >
                    Code {client.referral_code}
                    {copyId === client.user_id ? ' · Copied' : ' · Copy'}
                  </button>
                ) : (
                  <p className="mt-1 text-xs text-muted">No referral code yet</p>
                )}
                {client.credits.length > 0 ? (
                  <ul className="mt-2 space-y-0.5 text-xs text-chalk">
                    {client.credits.map((c) => (
                      <li key={`${c.source_kind}-${c.source_id}`}>{creditLabel(c)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-muted">No active blowout credits</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {clients.length > 0 ? (
        <p className="text-xs text-muted">
          {filtered.length} of {clients.length} client{clients.length === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  );
}
