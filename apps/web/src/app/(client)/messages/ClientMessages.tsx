'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';
import { CLIENT_MESSAGE_QUICK_REPLIES, MYSTIC_STYLIST } from '@template/mystic';
import {
  MysticMessageThread,
  type ThreadMessage,
  type ThreadParticipants,
} from '@/components/mystic/MysticMessageThread';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { requireBrowserSession } from '@/lib/supabase/browser-session';

const POLL_MS = 18_000;

export function ClientMessages() {
  const workspaceId = getMysticWorkspaceId();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ThreadParticipants>({
    stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.avatarPath },
  });

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!workspaceId) return;
      if (!opts?.silent) setRefreshing(true);
      const auth = await requireBrowserSession();
      const uid = auth?.user.id;
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
              stylist: { name: MYSTIC_STYLIST.name, avatarUrl: MYSTIC_STYLIST.avatarPath },
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
      try {
        const res = await authorizedFetch(
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
      } catch {
        setLoadError('Sign in to message Luke');
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
    try {
      const res = await authorizedFetch('/api/mystic/messages', {
        method: 'POST',
        body: JSON.stringify({ workspaceId, body: body.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((m) => [...m, data.message]);
        setLastUpdatedAt(Date.now());
        return { ok: true };
      }
      return { ok: false, error: data.error ?? 'Could not send' };
    } catch {
      return { ok: false, error: 'Sign in to message Luke' };
    }
  }

  const initialLoading = refreshing && messages.length === 0 && !loadError && !lastUpdatedAt;

  return (
    <MysticClientPage width="chat" className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <header className="lg:sticky lg:top-24 lg:self-start">
          <MysticPageIntro
            eyebrow="Messages"
            title="Message Luke"
            description="Text timing, inspo, or parking — Luke replies between house calls."
          />
          <div className="mt-5">
            <MysticStylistChip size={52} />
          </div>
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {loadError ? (
            <div className="mb-4 space-y-2 rounded-xl border border-line bg-paper px-3 py-3">
              <p className="text-sm text-plum">
                {loadError}
                {loadError.toLowerCase().includes('sign in') ? (
                  <>
                    {' '}
                    <Link
                      href="/login"
                      className="font-medium text-plum underline underline-offset-2"
                    >
                      Sign in
                    </Link>
                  </>
                ) : null}
              </p>
              {!loadError.toLowerCase().includes('sign in') ? (
                <button
                  type="button"
                  onClick={() => void load()}
                  className="text-sm font-medium text-accent underline"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}
          {initialLoading ? (
            <MysticSalonLoader copyKey="messages" className="flex-1 py-12" />
          ) : (
            <MysticMessageThread
              layout="room"
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
          )}
        </div>
      </div>
    </MysticClientPage>
  );
}
