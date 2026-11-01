'use client';

import { useCallback, useState } from 'react';
import type { WeeklyHoursDay, WeekdayIndex } from '@template/mystic';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { mysticCard, mysticInput, mysticStudioBtn } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function StudioSchedulingPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(20);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [weekly, setWeekly] = useState<Partial<Record<WeekdayIndex, WeeklyHoursDay>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    void fetch(`/api/mystic/studio/settings?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setStartHour(s.booking_start_hour ?? 9);
          setEndHour(s.booking_end_hour ?? 20);
          setSlotMinutes(s.slot_minutes ?? 30);
          setWeekly((s.weekly_hours ?? {}) as Partial<Record<WeekdayIndex, WeeklyHoursDay>>);
        }
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function save() {
    if (!workspaceId) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/mystic/studio/scheduling', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        bookingStartHour: startHour,
        bookingEndHour: endHour,
        slotMinutes,
        weeklyHours: weekly,
      }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Availability saved.' : 'Save failed — try again.');
  }

  function dayRow(index: WeekdayIndex) {
    const row = weekly[index] ?? { enabled: true, startHour, endHour };
    return (
      <div key={index} className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex w-16 items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) =>
              setWeekly((w) => ({
                ...w,
                [index]: { ...row, enabled: e.target.checked },
              }))
            }
          />
          {DAY_LABELS[index]}
        </label>
        <input
          type="number"
          min={0}
          max={23}
          value={row.startHour}
          disabled={!row.enabled}
          onChange={(e) =>
            setWeekly((w) => ({
              ...w,
              [index]: { ...row, startHour: Number(e.target.value) },
            }))
          }
          className={`${mysticInput} w-16`}
        />
        <span className="text-muted">–</span>
        <input
          type="number"
          min={1}
          max={24}
          value={row.endHour}
          disabled={!row.enabled}
          onChange={(e) =>
            setWeekly((w) => ({
              ...w,
              [index]: { ...row, endHour: Number(e.target.value) },
            }))
          }
          className={`${mysticInput} w-16`}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={mysticCard + ' p-6'} aria-busy="true">
        <MysticSalonLoader copyKey="settings" size="sm" />
      </div>
    );
  }

  return (
    <div className={`${mysticCard} space-y-4 p-6`}>
      <h3 className="font-medium text-ink">Booking hours</h3>
      <p className="text-xs text-muted">Default window when a day has no override below.</p>
      <div className="flex flex-wrap gap-3 text-sm">
        <label>
          Start hour
          <input
            type="number"
            min={0}
            max={23}
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            className={`${mysticInput} mt-1 w-20`}
          />
        </label>
        <label>
          End hour
          <input
            type="number"
            min={1}
            max={24}
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className={`${mysticInput} mt-1 w-20`}
          />
        </label>
        <label>
          Slot step (min)
          <input
            type="number"
            min={15}
            max={60}
            step={15}
            value={slotMinutes}
            onChange={(e) => setSlotMinutes(Number(e.target.value))}
            className={`${mysticInput} mt-1 w-20`}
          />
        </label>
      </div>
      <div className="space-y-2 border-t border-line/60 pt-4">
        <p className="text-xs font-medium text-muted">Per-day overrides</p>
        {([0, 1, 2, 3, 4, 5, 6] as WeekdayIndex[]).map(dayRow)}
      </div>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={mysticStudioBtn}
      >
        {saving ? 'Saving…' : 'Save availability'}
      </button>
    </div>
  );
}
