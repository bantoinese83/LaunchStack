'use client';

import { useEffect, useState } from 'react';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Credit = {
  source_kind: string;
  source_id: string;
  blowouts_remaining: number;
  expires_at: string | null;
};

type Client = {
  user_id: string;
  phone: string | null;
  referral_code: string | null;
  full_name: string | null;
  email: string | null;
  credits: Credit[];
};

export function ClientsPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []));
  }, [workspaceId]);

  if (clients.length === 0) {
    return <MysticEmptyState variant="clients" className="mt-6" />;
  }

  return (
    <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
      {clients.map((client) => (
        <li key={client.user_id} className="p-4">
          <p className="font-medium">
            {client.full_name ?? client.email ?? client.user_id.slice(0, 8)}
          </p>
          <p className="text-sm text-muted">{client.phone ?? 'No phone'}</p>
          {client.referral_code ? (
            <p className="mt-1 font-mono text-xs text-accent">Code {client.referral_code}</p>
          ) : null}
          {client.credits.length > 0 ? (
            <ul className="mt-2 text-xs text-chalk">
              {client.credits.map((c) => (
                <li key={`${c.source_kind}-${c.source_id}`}>
                  {c.blowouts_remaining} left · {c.source_kind} {c.source_id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted">No active credits</p>
          )}
        </li>
      ))}
    </ul>
  );
}
