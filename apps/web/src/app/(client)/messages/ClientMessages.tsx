'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { createSupabaseBrowserClient } from '@template/api';
import { CLIENT_MESSAGE_QUICK_REPLIES, MYSTIC_STYLIST } from '@template/mystic';
import {
  MysticMessageThread,
  type ThreadMessage,
  type ThreadParticipants,
} from '@/components/mystic/MysticMessageThread';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

const POLL_MS = 18_000;

export function ClientMessages() {
  const workspaceId = getMysticWorkspaceId();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ThreadParticipants>({
    stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.portraitPath },
  });

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!workspaceId) return;
      if (!opts?.silent) setRefreshing(true);
      const supabase = createSupabaseBrowserClient();
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) {
        setLoadError('Sign in to message Luke');
        setRefreshing(false);
        return;
      }
      setUserId(uid);
      void fetch('/api/mystic/client-profile')
        .then((r) => r.json())
        .then((data) => {
          const p = data.profile;
          if (p) {
            setParticipants({
              stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.portraitPath },
              client: {
                name: p.full_name ?? p.email ?? 'You',
                avatarUrl: p.avatar_url ?? null,
              },
            });
          }
        })
        .catch(() => {
          /* avatar optional */
        });
      const res = await fetch(
        `/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${uid}`
      );
      const data = await res.json();
      if (res.status === 401) {
        setLoadError('Sign in to message Luke');
      } else if (!res.ok) {
        setLoadError(data.error ?? 'Could not load messages');
      } else {
        setLoadError(null);
        setMessages(data.messages ?? []);
        setLastUpdatedAt(Date.now());
      }
      setRefreshing(false);
    },
    [workspaceId]
  );

  useDeferredEffect(() => void load(), [load]);

  useEffect(() => {
    if (!userId || !workspaceId) return;
    const id = setInterval(() => void load({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [userId, workspaceId, load]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') void load({ silent: true });
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  async function onSend(body: string) {
    if (!workspaceId) return { ok: false, error: 'Studio not configured' };
    const res = await fetch('/api/mystic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, body: body.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((m) => [...m, data.message]);
      setLastUpdatedAt(Date.now());
      return { ok: true };
    }
    return { ok: false, error: data.error ?? 'Could not send' };
  }

  return (
    <MysticClientPage>
      <MysticPageIntro eyebrow="Messages" title="Message Luke" />
      {loadError ? (
        <p className="text-sm text-plum">
          {loadError}
          {loadError.toLowerCase().includes('sign in') ? (
            <>
              {' '}
              <Link href="/login" className="font-medium text-plum underline underline-offset-2">
                Sign in
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <MysticMessageThread
        messages={messages}
        mode="client"
        placeholder="Hey Luke…"
        quickReplies={CLIENT_MESSAGE_QUICK_REPLIES}
        participants={participants}
        onSend={onSend}
        onRefresh={() => void load()}
        refreshing={refreshing}
        lastUpdatedAt={lastUpdatedAt}
      />
    </MysticClientPage>
  );
}
