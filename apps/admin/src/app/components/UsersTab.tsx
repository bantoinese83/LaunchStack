'use client';

import { useState } from 'react';
import { Button, Card } from '@template/ui';
import type { Profile } from '@template/types';
import { adminFetch } from '@/lib/admin-fetch';

export function UsersTab({ users }: { users: Profile[] }) {
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const impersonate = async (email: string) => {
    setError(null);
    setLink(null);
    const response = await adminFetch('/api/admin/impersonate', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      setError('Could not generate impersonation link');
      return;
    }
    const payload = (await response.json()) as { actionLink: string };
    setLink(payload.actionLink);
  };

  return (
    <Card className="animate-[rise_350ms_ease-out]">
      <p className="type-eyebrow text-accent">Directory</p>
      <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-ink">Users</h3>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {link ? (
        <p className="mt-3 break-all text-xs text-muted">Magic link (open as the user): {link}</p>
      ) : null}
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/80">
            <tr>
              <th className="px-3 py-3 text-muted">Email</th>
              <th className="px-3 py-3 text-muted">Name</th>
              <th className="px-3 py-3 text-muted">Role</th>
              <th className="px-3 py-3 text-muted">Created</th>
              <th className="px-3 py-3 text-muted">Impersonate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-3 py-3 font-medium text-ink">{user.email}</td>
                <td className="px-3 py-3 text-muted">{user.full_name || '—'}</td>
                <td className="px-3 py-3 text-muted">{user.system_role}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-3">
                  <Button variant="ghost" size="sm" onClick={() => void impersonate(user.email)}>
                    Generate link
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
