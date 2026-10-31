'use client';

import { useEffect, useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Message = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
};

type Client = {
  user_id: string;
  full_name: string | null;
  email: string | null;
};

export function ThreadComposer() {
  const workspaceId = getMysticWorkspaceId();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientUserId, setClientUserId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []));
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !clientUserId) return;
    void fetch(`/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${clientUserId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setError('Could not load thread'));
  }, [workspaceId, clientUserId]);

  async function send() {
    if (!workspaceId || !clientUserId) return;
    const res = await fetch('/api/mystic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, clientUserId, body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMessages((m) => [...m, data.message]);
    setBody('');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="text-sm font-medium">Client</label>
        <select
          value={clientUserId}
          onChange={(e) => setClientUserId(e.target.value)}
          className="w-full rounded-xl border border-line px-3 py-2 text-sm"
        >
          <option value="">Select client…</option>
          {clients.map((c) => (
            <option key={c.user_id} value={c.user_id}>
              {c.full_name ?? c.email ?? c.user_id.slice(0, 8)}
            </option>
          ))}
        </select>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reply as Luke…"
          className="min-h-24 w-full rounded-xl border border-line px-3 py-2"
        />
        <button
          type="button"
          onClick={send}
          className="rounded-full bg-accent px-5 py-2 text-sm text-white"
        >
          Send
        </button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
      <ul className="max-h-96 space-y-2 overflow-y-auto rounded-2xl border border-line bg-surface p-4">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              msg.sender_role === 'stylist' ? 'bg-accent-soft' : 'bg-paper'
            }`}
          >
            <p className="text-xs uppercase text-muted">{msg.sender_role}</p>
            <p>{msg.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
