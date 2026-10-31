'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@template/api';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { mysticCard, mysticInput } from '@/components/mystic/mystic-styles';
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

  useEffect(() => {
    let cancelled = false;
    async function fetchMessages() {
      const supabase = createSupabaseBrowserClient();
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId || !workspaceId || cancelled) return;
      const res = await fetch(
        `/api/mystic/messages?workspaceId=${workspaceId}&clientUserId=${userId}`
      );
      const data = await res.json();
      if (!cancelled && res.ok) setMessages(data.messages ?? []);
    }
    void fetchMessages();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

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
    <div className="mx-auto max-w-lg">
      <MysticPageIntro
        eyebrow="Messages"
        title="Message Luke"
        description="House-call questions, inspo, or schedule tweaks — one thread with your stylist."
      />
      <ul className={`${mysticCard} mt-8 max-h-72 space-y-2 overflow-y-auto p-4`}>
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`rounded-2xl px-3 py-2 text-sm ${
              msg.sender_role === 'stylist' ? 'bg-accent-soft' : 'border border-line/80 bg-paper'
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
        className={`${mysticInput} mt-6 min-h-32`}
        placeholder="Hey Luke…"
      />
      <MysticMagneticButton type="button" onClick={send} className="mt-4">
        Send
      </MysticMagneticButton>
      {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}
    </div>
  );
}
