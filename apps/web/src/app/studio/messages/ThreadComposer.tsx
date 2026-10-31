'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MYSTIC_STYLIST, STUDIO_MESSAGE_QUICK_REPLIES } from '@template/mystic';
import { MysticMessageThread, type ThreadMessage } from '@/components/mystic/MysticMessageThread';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticInput } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Client = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

const POLL_MS = 15_000;

export function ThreadComposer() {
  const workspaceId = getMysticWorkspaceId();
  const searchParams = useSearchParams();
  const initialClient = searchParams.get('client') ?? '';

  const [clients, setClients] = useState<Client[]>([]);
  const [clientUserId, setClientUserId] = useState(initialClient);
  const [clientFilter, setClientFilter] = useState('');
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useDeferredEffect(() => {
    if (initialClient) setClientUserId(initialClient);
  }, [initialClient]);

  useDeferredEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []));
  }, [workspaceId]);

  const filteredClients = useMemo(() => {
    const q = clientFilter.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const label = (c.full_name ?? c.email ?? c.user_id).toLowerCase();
      return label.includes(q);
    });
  }, [clients, clientFilter]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.user_id === clientUserId),
    [clients, clientUserId]
  );

  const loadThread = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!workspaceId || !clientUserId) return;
      if (!opts?.silent) setRefreshing(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${clientUserId}`
        );
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages ?? []);
          setLastUpdatedAt(Date.now());
        } else {
          setError(data.error ?? 'Could not load thread');
        }
      } catch {
        setError('Could not load thread');
      }
      setRefreshing(false);
    },
    [workspaceId, clientUserId]
  );

  useDeferredEffect(() => void loadThread(), [loadThread]);

  useEffect(() => {
    if (!clientUserId) return;
    const id = setInterval(() => void loadThread({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [clientUserId, loadThread]);

  async function onSend(body: string) {
    if (!workspaceId || !clientUserId) {
      return { ok: false, error: 'Select a client first' };
    }
    const res = await fetch('/api/mystic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, clientUserId, body: body.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return { ok: false, error: data.error ?? 'Could not send' };
    }
    setMessages((m) => [...m, data.message]);
    setLastUpdatedAt(Date.now());
    return { ok: true };
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:gap-6">
      <aside className={`${mysticCard} flex flex-col gap-4 p-4`}>
        <div>
          <label className="text-sm font-medium">Find client</label>
          <input
            type="search"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            placeholder="Name or email…"
            className={`${mysticInput} mt-1`}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Thread</label>
          <select
            value={clientUserId}
            onChange={(e) => setClientUserId(e.target.value)}
            className={`${mysticInput} mt-1`}
          >
            <option value="">Select client…</option>
            {filteredClients.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.full_name ?? c.email ?? c.user_id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        {selectedClient ? (
          <div className="flex items-center gap-3">
            <MysticUserAvatar
              url={selectedClient.avatar_url}
              name={selectedClient.full_name ?? selectedClient.email ?? undefined}
              size={40}
            />
            <p className="text-xs text-muted">
              Messaging{' '}
              <span className="font-medium text-ink">
                {selectedClient.full_name ?? selectedClient.email}
              </span>
            </p>
          </div>
        ) : null}
        {clientUserId ? (
          <Link
            href={`/studio/messages?client=${clientUserId}`}
            className="text-xs text-accent underline"
          >
            Copy link to this thread
          </Link>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </aside>
      <div className={clientUserId ? '' : 'opacity-60 pointer-events-none'}>
        <MysticMessageThread
          messages={messages}
          mode="studio"
          placeholder={clientUserId ? 'Reply as Luke…' : 'Select a client to reply…'}
          quickReplies={STUDIO_MESSAGE_QUICK_REPLIES}
          participants={{
            stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.portraitPath },
            client: selectedClient
              ? {
                  name: selectedClient.full_name ?? selectedClient.email ?? undefined,
                  avatarUrl: selectedClient.avatar_url,
                }
              : undefined,
          }}
          onSend={onSend}
          onRefresh={clientUserId ? () => void loadThread() : undefined}
          refreshing={refreshing}
          lastUpdatedAt={lastUpdatedAt}
        />
      </div>
    </div>
  );
}
