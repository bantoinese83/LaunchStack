'use client';

import { useCallback, useState } from 'react';
import { formatUsd } from '@template/mystic';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticInput, mysticStudioBtn } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

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
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
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
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useDeferredEffect(load, [load]);

  async function save() {
    if (!workspaceId) return;
    setSaving(true);
    setMessage(null);
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
    setSaving(false);
    setMessage(
      res.ok
        ? { kind: 'ok', text: 'Saved — booking quotes use these numbers immediately.' }
        : { kind: 'error', text: data.error ?? 'Save failed' }
    );
  }

  if (!workspaceId) {
    return <StudioWorkspaceNotice />;
  }

  if (loading) {
    return <div className={`${mysticCard} h-64 animate-pulse`} aria-busy="true" />;
  }

  return (
    <div className={`${mysticCard} max-w-lg space-y-5 p-6`}>
      <div>
        <h3 className="font-medium text-ink">Travel & buffers</h3>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={winterBufferEnabled}
            onChange={(e) => setWinterBufferEnabled(e.target.checked)}
          />
          Winter buffer (45 min between stops)
        </label>
      </div>

      <div>
        <h3 className="font-medium text-ink">Surcharges (one-off clients)</h3>
        <p className="mt-1 text-xs text-muted">
          Members and package holders are exempt at checkout.
        </p>
        <label className="mt-3 block text-sm">
          After 8:00 PM fee (USD)
          <input
            type="text"
            inputMode="decimal"
            value={eveningSurchargeUsd}
            onChange={(e) => setEveningSurchargeUsd(e.target.value)}
            className={`${mysticInput} mt-1`}
          />
        </label>
        <label className="mt-3 block text-sm">
          Miles included from River North
          <input
            type="number"
            min={0}
            step={0.5}
            value={includedMiles}
            onChange={(e) => setIncludedMiles(Number(e.target.value))}
            className={`${mysticInput} mt-1`}
          />
        </label>
        <label className="mt-3 block text-sm">
          Per mile beyond included (USD)
          <input
            type="text"
            inputMode="decimal"
            value={perMileUsd}
            onChange={(e) => setPerMileUsd(e.target.value)}
            className={`${mysticInput} mt-1`}
          />
        </label>
      </div>

      <div>
        <h3 className="font-medium text-ink">Deposits & door timer</h3>
        <label className="mt-3 block text-sm">
          Booking deposit (USD) — captured on no-show / door timer
          <input
            type="text"
            inputMode="decimal"
            value={depositUsd}
            onChange={(e) => setDepositUsd(e.target.value)}
            className={`${mysticInput} mt-1`}
          />
          <span className="mt-1 block text-xs text-muted">
            Preview: {formatUsd(usdToCents(depositUsd))}
          </span>
        </label>
        <label className="mt-3 block text-sm">
          Door timer (minutes)
          <input
            type="number"
            min={1}
            max={120}
            value={doorTimerMinutes}
            onChange={(e) => setDoorTimerMinutes(Number(e.target.value))}
            className={`${mysticInput} mt-1`}
          />
        </label>
      </div>

      <div>
        <h3 className="font-medium text-ink">Referrals</h3>
        <label className="mt-3 block text-sm">
          Free blowout credit after this many credited referrals
          <input
            type="number"
            min={1}
            max={50}
            value={referralRewardAfter}
            onChange={(e) => setReferralRewardAfter(Number(e.target.value))}
            className={`${mysticInput} mt-1`}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={`${mysticStudioBtn} disabled:opacity-50`}
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
      {message ? (
        <p className={`text-sm ${message.kind === 'ok' ? 'text-chalk' : 'text-danger'}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
