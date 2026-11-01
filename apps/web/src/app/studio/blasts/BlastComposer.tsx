'use client';

import { useCallback, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import {
  mysticCard,
  mysticInput,
  mysticStudioBtn,
  mysticStudioBtnOutline,
} from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type BlastRow = {
  id: string;
  channel: string;
  segment: string;
  subject: string | null;
  created_at: string;
  recipient_count: number | null;
};

export function BlastComposer() {
  const workspaceId = getMysticWorkspaceId();
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('both');
  const [segment, setSegment] = useState<'all' | 'members' | 'packages' | 'upcoming_week'>('all');
  const [subject, setSubject] = useState('Mystic Hair Co.');
  const [body, setBody] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<BlastRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = useCallback(() => {
    if (!workspaceId) {
      setHistoryLoading(false);
      return;
    }
    void fetch(`/api/mystic/blasts?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setHistory(data.blasts ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [workspaceId]);

  useDeferredEffect(loadHistory, [loadHistory]);

  async function send() {
    const trimmed = body.trim();
    if (!workspaceId) {
      setStatus({ kind: 'error', text: 'Set NEXT_PUBLIC_MYSTIC_WORKSPACE_ID' });
      return;
    }
    if (!trimmed) {
      setStatus({ kind: 'error', text: 'Write a message before sending' });
      return;
    }
    if (
      !window.confirm(
        `Send this blast to the “${segment.replace(/_/g, ' ')}” segment via ${channel}?`
      )
    ) {
      return;
    }
    setSending(true);
    setStatus(null);
    const res = await fetch('/api/mystic/blasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        channel,
        segment,
        subject: subject.trim() || 'Mystic Hair Co.',
        body: trimmed,
        ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
      }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setStatus({
        kind: 'ok',
        text: `Sent to ${data.sent} recipient${data.sent === 1 ? '' : 's'}`,
      });
      setBody('');
      loadHistory();
    } else {
      setStatus({ kind: 'error', text: data.error ?? 'Send failed' });
    }
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-6">
      <div className={`${mysticCard} space-y-4 p-6`}>
        <h2 className="text-sm font-medium text-ink">Compose blast</h2>
        <label className="block text-xs text-muted">
          Channel
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
            className={`${mysticInput} mt-1`}
          >
            <option value="email">Email (Brevo)</option>
            <option value="sms">SMS (Twilio)</option>
            <option value="both">Email + SMS</option>
          </select>
        </label>
        <label className="block text-xs text-muted">
          Audience
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as typeof segment)}
            className={`${mysticInput} mt-1`}
          >
            <option value="all">All clients</option>
            <option value="members">Members only</option>
            <option value="packages">Package holders</option>
            <option value="upcoming_week">Visits in the next 7 days</option>
          </select>
        </label>
        {(channel === 'email' || channel === 'both') && (
          <label className="block text-xs text-muted">
            Email subject
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`${mysticInput} mt-1`}
            />
          </label>
        )}
        <label className="block text-xs text-muted">
          Promo code (optional)
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Appended to message for checkout"
            className={`${mysticInput} mt-1`}
          />
        </label>
        <label className="block text-xs text-muted">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Out of town next week? Holiday promo? …"
            rows={6}
            className={`${mysticInput} mt-1 min-h-[140px] resize-y`}
          />
        </label>
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !body.trim()}
          className={`${mysticStudioBtn} disabled:opacity-50`}
        >
          {sending ? 'Sending…' : 'Send blast'}
        </button>
        {status ? (
          <p className={`text-sm ${status.kind === 'ok' ? 'text-chalk' : 'text-danger'}`}>
            {status.text}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Recent blasts</h2>
          <button
            type="button"
            onClick={loadHistory}
            className={`${mysticStudioBtnOutline} text-xs`}
          >
            Refresh
          </button>
        </div>
        {historyLoading ? (
          <MysticSalonLoader copyKey="history" size="sm" className="py-4" />
        ) : history.length === 0 ? (
          <MysticEmptyState
            variant="generic"
            compact
            eyebrow="Blasts"
            title="No sends yet"
            description="Your first SMS blast will show here with delivery stats."
            className="mb-0"
          />
        ) : (
          <ul className={`${mysticCard} divide-y divide-line/80 overflow-hidden p-0`}>
            {history.slice(0, 12).map((row) => (
              <li key={row.id} className="px-4 py-3 text-sm">
                <p className="font-medium text-ink">
                  {row.subject ?? 'SMS blast'} · {row.channel}
                </p>
                <p className="text-xs text-muted">
                  {row.segment.replace(/_/g, ' ')} · {row.recipient_count ?? '—'} recipients ·{' '}
                  {new Date(row.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
