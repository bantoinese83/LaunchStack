'use client';

import { useEffect, useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Row = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
};

export function StudioCalendar() {
  const [rows, setRows] = useState<Row[]>([]);
  const workspaceId = getMysticWorkspaceId();

  useEffect(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 14);
    void fetch(
      `/api/mystic/appointments?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => setRows(data.appointments ?? []))
      .catch(() => setRows([]));
  }, [workspaceId]);

  const byDay = rows.reduce<Record<string, Row[]>>((acc, row) => {
    const key = new Date(row.starts_at).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    acc[key] = acc[key] ?? [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.keys(byDay).length === 0 ? (
        <p className="text-sm text-muted">
          No appointments this week — or migration not applied yet.
        </p>
      ) : (
        Object.entries(byDay).map(([day, items]) => (
          <div key={day} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-medium">{day}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg bg-paper px-3 py-2">
                  {new Date(item.starts_at).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  · {item.service_id} · {item.status.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
