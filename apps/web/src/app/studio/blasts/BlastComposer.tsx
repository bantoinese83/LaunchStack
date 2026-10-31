'use client';

import { useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export function BlastComposer() {
  const workspaceId = getMysticWorkspaceId();
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('both');
  const [segment, setSegment] = useState<'all' | 'members' | 'packages' | 'upcoming_week'>('all');
  const [subject, setSubject] = useState('Mystic Hair Co.');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function send() {
    if (!workspaceId) {
      setStatus('Set NEXT_PUBLIC_MYSTIC_WORKSPACE_ID');
      return;
    }
    const res = await fetch('/api/mystic/blasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, channel, segment, subject, body }),
    });
    const data = await res.json();
    setStatus(res.ok ? `Sent to ${data.sent} recipients` : data.error);
  }

  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-medium">Email & SMS blast</h2>
      <select
        value={channel}
        onChange={(e) => setChannel(e.target.value as typeof channel)}
        className="w-full rounded-xl border border-line px-3 py-2"
      >
        <option value="email">Email (Brevo)</option>
        <option value="sms">SMS (Twilio)</option>
        <option value="both">Both</option>
      </select>
      <select
        value={segment}
        onChange={(e) => setSegment(e.target.value as typeof segment)}
        className="w-full rounded-xl border border-line px-3 py-2"
      >
        <option value="all">All clients</option>
        <option value="members">Members</option>
        <option value="packages">Package holders</option>
        <option value="upcoming_week">Upcoming week</option>
      </select>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email subject"
        className="w-full rounded-xl border border-line px-3 py-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Out of town? Holiday promo? …"
        className="min-h-32 w-full rounded-xl border border-line px-3 py-2"
      />
      <button
        type="button"
        onClick={send}
        className="rounded-full bg-shell px-6 py-2.5 text-sm font-medium text-paper"
      >
        Send blast
      </button>
      {status ? <p className="text-sm text-muted">{status}</p> : null}
    </div>
  );
}
