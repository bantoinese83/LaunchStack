'use client';

import { useEffect, useState } from 'react';
import { formatUsd } from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

function centsToUsd(cents: number) {
  return (cents / 100).toFixed(2);
}

function usdToCents(value: string) {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function SettingsForm() {
  const workspaceId = getMysticWorkspaceId();
  const [winterBufferEnabled, setWinterBufferEnabled] = useState(false);
  const [doorTimerMinutes, setDoorTimerMinutes] = useState(15);
  const [depositUsd, setDepositUsd] = useState('25.00');
  const [eveningSurchargeUsd, setEveningSurchargeUsd] = useState('25.00');
  const [includedMiles, setIncludedMiles] = useState(5);
  const [perMileUsd, setPerMileUsd] = useState('5.00');
  const [referralRewardAfter, setReferralRewardAfter] = useState(5);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    void fetch(`/api/mystic/studio/settings?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setWinterBufferEnabled(s.winter_buffer_enabled);
          setDoorTimerMinutes(s.door_timer_minutes);
          setDepositUsd(centsToUsd(s.deposit_cents));
          setEveningSurchargeUsd(centsToUsd(s.evening_surcharge_cents));
          setIncludedMiles(Number(s.included_miles));
          setPerMileUsd(centsToUsd(s.per_mile_surcharge_cents));
          setReferralRewardAfter(s.referral_reward_after);
        }
      });
  }, [workspaceId]);

  async function save() {
    if (!workspaceId) return;
    const res = await fetch('/api/mystic/studio/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        winterBufferEnabled,
        doorTimerMinutes,
        depositCents: usdToCents(depositUsd),
        eveningSurchargeCents: usdToCents(eveningSurchargeUsd),
        includedMiles,
        perMileSurchargeCents: usdToCents(perMileUsd),
        referralRewardAfter,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Saved — booking quotes use these numbers immediately.' : data.error);
  }

  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-medium">Travel & buffers</h3>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={winterBufferEnabled}
          onChange={(e) => setWinterBufferEnabled(e.target.checked)}
        />
        Winter buffer (45 min between stops)
      </label>

      <h3 className="pt-2 font-medium">Surcharges (one-off clients only)</h3>
      <p className="text-xs text-muted">Members and package holders are exempt at checkout.</p>
      <label className="block text-sm">
        After 8:00 PM fee (USD)
        <input
          type="text"
          inputMode="decimal"
          value={eveningSurchargeUsd}
          onChange={(e) => setEveningSurchargeUsd(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Miles included from River North
        <input
          type="number"
          min={0}
          step={0.5}
          value={includedMiles}
          onChange={(e) => setIncludedMiles(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Per mile beyond included (USD)
        <input
          type="text"
          inputMode="decimal"
          value={perMileUsd}
          onChange={(e) => setPerMileUsd(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>

      <h3 className="pt-2 font-medium">Deposits & door timer</h3>
      <label className="block text-sm">
        Booking deposit (USD) — captured on no-show / door timer
        <input
          type="text"
          inputMode="decimal"
          value={depositUsd}
          onChange={(e) => setDepositUsd(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
        <span className="mt-1 block text-xs text-muted">
          Preview: {formatUsd(usdToCents(depositUsd))}
        </span>
      </label>
      <label className="block text-sm">
        Door timer (minutes)
        <input
          type="number"
          value={doorTimerMinutes}
          onChange={(e) => setDoorTimerMinutes(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>

      <h3 className="pt-2 font-medium">Referrals</h3>
      <label className="block text-sm">
        Free blowout credit after this many credited referrals
        <input
          type="number"
          min={1}
          max={50}
          value={referralRewardAfter}
          onChange={(e) => setReferralRewardAfter(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>

      <button
        type="button"
        onClick={save}
        className="rounded-full bg-shell px-5 py-2 text-sm text-paper"
      >
        Save settings
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
