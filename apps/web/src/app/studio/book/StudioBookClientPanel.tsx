'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  SERVICE_IDS,
  computeBookingQuote,
  formatUsd,
  getServiceById,
  scheduledAtFromBookingSlot,
  type ServiceId,
} from '@template/mystic';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { StudioWorkspaceNotice } from '@/components/mystic/studio/StudioWorkspaceNotice';
import { mysticCard, mysticInput, mysticStudioBtn } from '@/components/mystic/mystic-styles';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

type Client = { user_id: string; full_name: string | null; email: string | null };

export function StudioBookClientPanel() {
  const workspaceId = getMysticWorkspaceId();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientUserId, setClientUserId] = useState('');
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('Chicago');
  const [state, setState] = useState('IL');
  const [postalCode, setPostalCode] = useState('');
  const [distanceMiles, setDistanceMiles] = useState(3);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [status, setStatus] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadClients = useCallback(() => {
    if (!workspaceId) {
      setLoadingClients(false);
      return;
    }
    void fetch(`/api/mystic/clients?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []))
      .finally(() => setLoadingClients(false));
  }, [workspaceId]);

  useDeferredEffect(loadClients, [loadClients]);

  useDeferredEffect(() => {
    if (!date || !serviceId) return;
    void fetch(`/api/mystic/availability?date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []));
  }, [date, serviceId]);

  const quote = useMemo(() => {
    if (!date || !slot) return null;
    const scheduledAt = scheduledAtFromBookingSlot(date, slot);
    if (Number.isNaN(scheduledAt.getTime())) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles,
      entitlement,
    });
  }, [date, slot, serviceId, distanceMiles, entitlement]);

  async function submit() {
    if (!workspaceId || !clientUserId || !date || !slot || !line1 || !quote) return;
    setBusy(true);
    setStatus(null);
    setCheckoutUrl(null);
    const scheduledAt = scheduledAtFromBookingSlot(date, slot);
    const expectedQuoteCents =
      entitlement !== 'none' && serviceId === 'blowout' ? 0 : quote.totalCents;

    const res = await fetch('/api/mystic/studio/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        clientUserId,
        serviceId,
        scheduledAt: scheduledAt.toISOString(),
        address: { line1, city, state, postalCode },
        distanceMiles,
        entitlement,
        quoteCents: expectedQuoteCents,
        surchargeJson: quote.surcharges,
        policiesAccepted: true,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error ?? 'Booking failed');
      return;
    }
    setCheckoutUrl(data.checkoutUrl);
    setStatus(data.mock ? 'Confirmed (dev — no Stripe).' : 'Send the client this pay link:');
  }

  if (!workspaceId) return <StudioWorkspaceNotice />;

  if (loadingClients) {
    return (
      <div className={mysticCard + ' p-8'}>
        <MysticSalonLoader copyKey="profile" />
      </div>
    );
  }

  return (
    <div className={`${mysticCard} max-w-xl space-y-4 p-6`}>
      <label className="block text-sm">
        Client
        <select
          value={clientUserId}
          onChange={(e) => setClientUserId(e.target.value)}
          className={`${mysticInput} mt-1`}
        >
          <option value="">Select…</option>
          {clients.map((c) => (
            <option key={c.user_id} value={c.user_id}>
              {c.full_name ?? c.email ?? c.user_id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Service
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value as ServiceId)}
          className={`${mysticInput} mt-1`}
        >
          {SERVICE_IDS.map((id) => (
            <option key={id} value={id}>
              {getServiceById(id).name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${mysticInput} mt-1`}
          />
        </label>
        <label className="text-sm">
          Time
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className={`${mysticInput} mt-1`}
          >
            <option value="">Pick slot</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Street
        <input
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={`${mysticInput} mt-1`}
        />
      </label>
      <div className="flex gap-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} className={mysticInput} />
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={`${mysticInput} w-16`}
        />
        <input
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className={mysticInput}
          placeholder="ZIP"
        />
      </div>
      <label className="block text-sm">
        Miles (estimate)
        <input
          type="number"
          step={0.1}
          value={distanceMiles}
          onChange={(e) => setDistanceMiles(Number(e.target.value))}
          className={`${mysticInput} mt-1 w-24`}
        />
      </label>
      <label className="block text-sm">
        Credits
        <select
          value={entitlement}
          onChange={(e) => setEntitlement(e.target.value as typeof entitlement)}
          className={`${mysticInput} mt-1`}
        >
          <option value="none">Menu price</option>
          <option value="membership">Use membership credit</option>
          <option value="package">Use package credit</option>
        </select>
      </label>
      {quote ? (
        <p className="text-sm text-muted">
          Quote: <strong className="text-ink">{formatUsd(quote.totalCents)}</strong>
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className={mysticStudioBtn}
      >
        {busy ? 'Creating…' : 'Create booking & pay link'}
      </button>
      {status ? <p className="text-sm text-accent">{status}</p> : null}
      {checkoutUrl ? (
        <p className="break-all font-mono text-xs text-ink">
          <a href={checkoutUrl} className="underline">
            {checkoutUrl}
          </a>
        </p>
      ) : null}
    </div>
  );
}
