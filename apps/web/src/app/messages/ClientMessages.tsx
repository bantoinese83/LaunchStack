'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@template/api';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Message = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
};

export function ClientMessages() {
  const workspaceId = getMysticWorkspaceId();
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId || !workspaceId) return;
    const res = await fetch(
      `/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${userId}`
    );
    const data = await res.json();
    if (res.ok) setMessages(data.messages ?? []);
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    if (!workspaceId) {
      setStatus('Studio not configured');
      return;
    }
    const res = await fetch('/api/mystic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, body }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((m) => [...m, data.message]);
      setBody('');
      setStatus('Sent');
    } else {
      setStatus(data.error);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <Link href="/visits" className="text-sm text-muted">
        ← Visits
      </Link>
      <h1 className="font-display mt-4 text-3xl font-medium">Message Luke</h1>
      <ul className="mt-6 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              msg.sender_role === 'stylist' ? 'bg-accent-soft' : 'bg-surface border border-line'
            }`}
          >
            <p className="text-xs uppercase text-muted">{msg.sender_role}</p>
            <p>{msg.body}</p>
          </li>
        ))}
      </ul>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mt-6 min-h-32 w-full rounded-2xl border border-line px-4 py-3"
        placeholder="Hey Luke…"
      />
      <button
        type="button"
        onClick={send}
        className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white"
      >
        Send
      </button>
      {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}
    </div>
  );
}
