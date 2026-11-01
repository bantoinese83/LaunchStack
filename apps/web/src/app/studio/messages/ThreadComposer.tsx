'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MYSTIC_STYLIST, STUDIO_MESSAGE_QUICK_REPLIES } from '@template/mystic';
import { mysticUserIdSchema } from '@template/validation';
import { MysticAiOrb } from '@/components/mystic/MysticAiOrb';
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

function isUserId(value: string) {
  return mysticUserIdSchema.safeParse(value).success;
}

export function ThreadComposer() {
  const workspaceId = getMysticWorkspaceId();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialClient = searchParams.get('client') ?? '';

  const [clients, setClients] = useState<Client[]>([]);
  const [clientUserId, setClientUserId] = useState(() =>
    isUserId(initialClient) ? initialClient : ''
  );
  const [clientFilter, setClientFilter] = useState('');
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiReplies, setAiReplies] = useState<string[] | null>(null);
  const [aiSituation, setAiSituation] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  useDeferredEffect(() => {
    if (isUserId(initialClient)) setClientUserId(initialClient);
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

  function selectClient(id: string) {
    setClientUserId(id);
    setMessages([]);
    setAiReplies(null);
    setAiSituation(null);
    setError(null);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('client', id);
    else params.delete('client');
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as '/studio/messages', {
      scroll: false,
    });
  }

  const loadThread = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!workspaceId || !clientUserId || !isUserId(clientUserId)) return;
      if (!opts?.silent) setRefreshing(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/mystic/messages?workspaceId=${encodeURIComponent(workspaceId)}&clientUserId=${encodeURIComponent(clientUserId)}`
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
    if (!clientUserId || !isUserId(clientUserId)) return;
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

  async function loadAiReplies() {
    if (!workspaceId || !clientUserId) return;
    setAiBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/mystic/ai/message-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, clientUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not draft replies');
        return;
      }
      setAiReplies(data.replies ?? []);
      setAiSituation(typeof data.situation === 'string' ? data.situation : null);
    } catch {
      setError('Could not draft replies');
    } finally {
      setAiBusy(false);
    }
  }

  async function copyThreadLink() {
    if (!clientUserId || typeof window === 'undefined') return;
    const url = `${window.location.origin}${pathname}?client=${encodeURIComponent(clientUserId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy link');
    }
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-8">
      <aside className={`${mysticCard} flex flex-col gap-5 p-5`}>
        <div>
          <label className="type-eyebrow text-plum">Find client</label>
          <input
            type="search"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            placeholder="Name or email…"
            className={`${mysticInput} mt-2`}
          />
        </div>
        <div>
          <label className="type-eyebrow text-plum">Thread</label>
          <select
            value={clientUserId}
            onChange={(e) => selectClient(e.target.value)}
            className={`${mysticInput} mt-2`}
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
          <div className="flex items-center gap-3 rounded-lg border border-line/60 bg-paper/80 px-3 py-3">
            <MysticUserAvatar
              url={selectedClient.avatar_url}
              name={selectedClient.full_name ?? selectedClient.email ?? undefined}
              size={44}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {selectedClient.full_name ?? selectedClient.email}
              </p>
              {selectedClient.email && selectedClient.full_name ? (
                <p className="truncate text-xs text-muted">{selectedClient.email}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Pick a client to open their private thread.</p>
        )}
        {clientUserId ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyThreadLink()}
              className="mystic-interactive self-start text-xs font-medium text-accent underline"
            >
              {copied ? 'Link copied' : 'Copy link to this thread'}
            </button>
            <button
              type="button"
              disabled={aiBusy}
              onClick={() => void loadAiReplies()}
              className="mystic-interactive inline-flex items-center gap-2 self-start text-xs font-medium text-accent underline disabled:opacity-50"
            >
              <MysticAiOrb active={aiBusy} size="xs" label="AI draft replies" />
              {aiBusy ? 'Drafting…' : 'AI draft replies'}
            </button>
          </div>
        ) : null}
        {aiSituation ? <p className="text-xs text-muted">{aiSituation}</p> : null}
        <Link href="/studio/clients" className="text-xs text-muted underline hover:text-ink">
          Open clients roster
        </Link>
        {error ? (
          <p className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </aside>
      <div className={clientUserId ? '' : 'pointer-events-none opacity-55'}>
        <MysticMessageThread
          messages={messages}
          mode="studio"
          placeholder={clientUserId ? 'Reply as Luke…' : 'Select a client to reply…'}
          quickReplies={aiReplies ?? STUDIO_MESSAGE_QUICK_REPLIES}
          participants={{
            stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.avatarPath },
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
