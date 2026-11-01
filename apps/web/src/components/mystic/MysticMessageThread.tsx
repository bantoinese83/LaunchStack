'use client';

import { useEffect, useRef, useState } from 'react';
import { formatMessageTimestamp, messageSenderLabel, MYSTIC_STYLIST } from '@template/mystic';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import {
  mysticCard,
  mysticInput,
  mysticPageStack,
  mysticToolbarRow,
} from '@/components/mystic/mystic-styles';

export type ThreadMessage = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
};

export type ThreadParticipants = {
  client?: { name?: string; avatarUrl?: string | null };
  stylist?: { name?: string; avatarUrl?: string | null };
};

type Props = {
  messages: ThreadMessage[];
  mode: 'client' | 'studio';
  placeholder: string;
  quickReplies?: readonly string[];
  emptyVariant?: 'messages';
  participants?: ThreadParticipants;
  onSend: (body: string) => Promise<{ ok: boolean; error?: string }>;
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdatedAt?: number | null;
};

function senderPeer(
  senderRole: string,
  mode: 'client' | 'studio',
  participants?: ThreadParticipants
) {
  const isStylist = senderRole === 'stylist';
  if (isStylist) {
    return {
      name: participants?.stylist?.name ?? MYSTIC_STYLIST.name,
      avatarUrl: participants?.stylist?.avatarUrl ?? MYSTIC_STYLIST.portraitPath,
    };
  }
  return {
    name: participants?.client?.name ?? (mode === 'studio' ? 'Client' : 'You'),
    avatarUrl: participants?.client?.avatarUrl,
  };
}

export function MysticMessageThread({
  messages,
  mode,
  placeholder,
  quickReplies,
  emptyVariant = 'messages',
  onSend,
  onRefresh,
  refreshing = false,
  lastUpdatedAt,
  participants,
}: Props) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [failedBody, setFailedBody] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sending]);

  async function send(override?: string) {
    const trimmed = (override ?? body).trim();
    if (!trimmed || sending) return;
    setSending(true);
    setStatus(null);
    setFailedBody(null);
    const result = await onSend(trimmed);
    setSending(false);
    if (result.ok) {
      setBody('');
      setStatus('Sent');
      window.setTimeout(() => setStatus(null), 2500);
    } else {
      setFailedBody(trimmed);
      setStatus(result.error ?? 'Could not send');
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className={`min-h-[380px] ${mysticPageStack}`}>
      <div className={`${mysticToolbarRow} text-xs text-muted`}>
        <span>
          {lastUpdatedAt
            ? `Updated ${formatMessageTimestamp(new Date(lastUpdatedAt).toISOString())}`
            : mode === 'studio'
              ? 'Client thread'
              : 'Private thread with your stylist'}
        </span>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="font-medium text-accent underline disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className={`${mysticCard} flex min-h-0 flex-1 flex-col overflow-hidden p-0`}
      >
        {messages.length === 0 ? (
          <div className="p-4">
            <MysticEmptyState
              variant={emptyVariant}
              compact
              title={mode === 'studio' ? 'Start the thread' : undefined}
              description={
                mode === 'studio'
                  ? 'No messages yet — send a quick note or parking tip below.'
                  : undefined
              }
            />
          </div>
        ) : (
          <ul className="flex max-h-[min(52vh,420px)] flex-1 flex-col gap-2 overflow-y-auto p-4">
            {messages.map((msg) => {
              const isSelf =
                mode === 'client' ? msg.sender_role !== 'stylist' : msg.sender_role === 'stylist';
              const peer = senderPeer(msg.sender_role, mode, participants);
              return (
                <li
                  key={msg.id}
                  className={`flex gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end`}
                >
                  <MysticUserAvatar
                    url={peer.avatarUrl}
                    name={peer.name}
                    size={38}
                    className="mb-5 ring-1 ring-line/50"
                  />
                  <div
                    className={`flex max-w-[78%] flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        isSelf
                          ? 'rounded-br-md bg-accent text-paper'
                          : 'rounded-bl-md bg-accent-soft text-ink'
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                        {messageSenderLabel(msg.sender_role, mode)}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                    </div>
                    <time className="mt-1 px-1 text-[10px] text-muted" dateTime={msg.created_at}>
                      {formatMessageTimestamp(msg.created_at)}
                    </time>
                  </div>
                </li>
              );
            })}
            {sending ? (
              <li className="flex justify-end">
                <span className="rounded-2xl bg-accent/20 px-3 py-2 text-xs text-muted">
                  Sending…
                </span>
              </li>
            ) : null}
            <li ref={endRef} aria-hidden />
          </ul>
        )}
      </div>

      {quickReplies?.length ? (
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setBody((b) => (b ? `${b} ${q}` : q))}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink transition hover:border-accent/40 hover:bg-accent-soft"
            >
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <textarea
        maxLength={4000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={3}
        className={`${mysticInput} min-h-[88px] resize-y`}
      />
      <p className="text-[11px] text-muted">Enter to send · Shift+Enter for a new line</p>
      <MysticMagneticButton
        type="button"
        onClick={() => void send()}
        disabled={sending || !body.trim()}
        fullWidth
      >
        {sending ? 'Sending…' : 'Send message'}
      </MysticMagneticButton>
      {status ? (
        <div
          className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${
            status === 'Sent' ? 'text-chalk' : 'text-danger'
          }`}
        >
          <p>{status === 'Sent' ? status : `Send failed — ${status}`}</p>
          {failedBody && status !== 'Sent' ? (
            <button
              type="button"
              className="font-medium text-accent underline"
              onClick={() => void send(failedBody)}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
