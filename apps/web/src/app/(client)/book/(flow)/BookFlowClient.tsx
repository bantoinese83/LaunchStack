'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  APPOINTMENT_TAGS,
  HOUSE_CALL_POLICIES,
  MYSTIC_SERVICES,
  computeBookingQuote,
  formatUsd,
  type ServiceId,
} from '@template/mystic';
import type { AppointmentTagId } from '@template/mystic';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticBookDateStrip } from '@/components/mystic/book/MysticBookDateStrip';
import { mysticCard, mysticInput, mysticTimeChip } from '@/components/mystic/mystic-styles';
import { MysticSecureBookingLine } from '@/components/mystic/MysticSecureBookingLine';
import { Alert } from '@template/ui';

type Step = 'service' | 'datetime' | 'location' | 'details' | 'review';

const STEP_HINT: Record<Step, string> = {
  service: 'Pick a service',
  datetime: 'Choose date & time',
  location: 'House-call address',
  details: 'Preferences & referral',
  review: 'Review summary before payment',
};

export function BookFlowClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('service');
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [distanceMiles, setDistanceMiles] = useState(3);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [tags, setTags] = useState<AppointmentTagId[]>([]);
  const [referredBy, setReferredBy] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [tipCents, setTipCents] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState({
    line1: '',
    city: 'Chicago',
    state: 'IL',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    if (!date) return;
    void fetch(`/api/mystic/availability?date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]));
  }, [date, serviceId]);

  const scheduledAt = useMemo(() => {
    if (!date || !time) return null;
    const normalized = time.length === 5 ? time : time.slice(0, 5);
    return new Date(`${date}T${normalized}:00`);
  }, [date, time]);

  const quote = useMemo(() => {
    if (!scheduledAt) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles,
      entitlement,
      tipCents,
    });
  }, [scheduledAt, serviceId, distanceMiles, entitlement, tipCents]);

  const stepIndex = ['service', 'datetime', 'location', 'details', 'review'].indexOf(step);

  function toggleTag(id: AppointmentTagId) {
    setTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id]
    );
  }

  async function payAndBook() {
    if (!quote || !scheduledAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        serviceId,
        scheduledAt: scheduledAt.toISOString(),
        address: {
          ...address,
          line2: address.notes || undefined,
        },
        distanceMiles,
        entitlement,
        quoteCents:
          entitlement !== 'none' && serviceId === 'blowout' ? 0 : quote.totalCents - tipCents,
        surchargeJson: quote.surcharges,
        tipCents,
        tags,
        referredByName: referredBy || undefined,
        referralCode: referralCode.trim() || undefined,
        clientNotes: address.notes || undefined,
        policiesAccepted: true,
      };

      const res = await fetch('/api/mystic/checkout/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent('/book')}`);
          return;
        }
        setError(data.error ?? 'Checkout failed');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError('Network error — try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full">
      <p className="type-eyebrow text-accent">Reserve</p>
      <h1 className="font-display mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        Book a house call
      </h1>
      <p className="mt-2 text-sm text-muted">
        Step {stepIndex + 1} of 5 · {STEP_HINT[step]}
      </p>

      <div
        className="mystic-progress-track mt-8"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={stepIndex + 1}
        aria-valuetext={`Step ${stepIndex + 1} of 5: ${STEP_HINT[step]}`}
      >
        <div
          className="mystic-progress-fill"
          style={{ width: `${((stepIndex + 1) / 5) * 100}%` }}
        />
      </div>

      {step === 'service' && (
        <section className="mt-8 space-y-3">
          {MYSTIC_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              aria-pressed={serviceId === service.id}
              onClick={() => setServiceId(service.id)}
              className={`${mysticCard} w-full p-5 text-left ${
                serviceId === service.id
                  ? 'border-shell/40 bg-accent-soft ring-2 ring-accent/35'
                  : 'hover:border-accent/30'
              }`}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{service.name}</p>
                  <p className="mt-1 text-sm text-muted">{service.description}</p>
                </div>
                <p className="font-medium">{formatUsd(service.priceCents)}</p>
              </div>
            </button>
          ))}
          <MysticMagneticButton
            type="button"
            onClick={() => setStep('datetime')}
            className="mt-6"
            fullWidth
          >
            Continue
          </MysticMagneticButton>
        </section>
      )}

      {step === 'datetime' && (
        <section className="mt-8 space-y-4">
          <label className="block text-sm font-medium">Date</label>
          <MysticBookDateStrip
            value={date}
            onChange={(iso) => {
              setDate(iso);
              setTime('');
            }}
          />
          <label className="block text-sm font-medium">Time</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(slots.length ? slots : ['10:00', '12:00', '15:00']).map((slot) => (
              <button
                key={slot}
                type="button"
                aria-pressed={time === slot}
                onClick={() => setTime(slot)}
                className={mysticTimeChip(time === slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium">Booking type</label>
          <select
            value={entitlement}
            onChange={(e) => setEntitlement(e.target.value as typeof entitlement)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3"
          >
            <option value="none">One-off (surcharges may apply)</option>
            <option value="membership">Member</option>
            <option value="package">Package holder</option>
          </select>
          <div className="flex gap-3">
            <MysticMagneticButton
              type="button"
              variant="secondary"
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('service')}
            >
              Back
            </MysticMagneticButton>
            <MysticMagneticButton
              type="button"
              disabled={!date || !time}
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('location')}
            >
              Continue
            </MysticMagneticButton>
          </div>
        </section>
      )}

      {step === 'location' && (
        <section className="mt-8 space-y-4">
          <input
            placeholder="Street address"
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="rounded-xl border border-line px-4 py-3"
            />
            <input
              placeholder="ZIP"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              className="rounded-xl border border-line px-4 py-3"
            />
          </div>
          <label className="block text-sm font-medium">Distance from River North (miles)</label>
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            value={distanceMiles}
            onChange={(e) => setDistanceMiles(Number(e.target.value))}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
          <textarea
            placeholder="Gate code, parking, pets…"
            value={address.notes}
            onChange={(e) => setAddress({ ...address, notes: e.target.value })}
            className="min-h-24 w-full rounded-xl border border-line px-4 py-3"
          />
          <div className="flex gap-3">
            <MysticMagneticButton
              type="button"
              variant="secondary"
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('datetime')}
            >
              Back
            </MysticMagneticButton>
            <MysticMagneticButton
              type="button"
              disabled={!address.line1 || !address.postalCode}
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('details')}
            >
              Continue
            </MysticMagneticButton>
          </div>
        </section>
      )}

      {step === 'details' && (
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {APPOINTMENT_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={tags.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 ${
                  tags.includes(tag.id) ? 'border-accent bg-accent-soft' : 'border-line'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
          <input
            placeholder="Referral code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
          <input
            placeholder="Or referred by (first & last name)"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
          <p className="text-sm text-muted">
            Inspo photos — upload up to 4 on My visits after booking.
          </p>
          <div className="flex gap-3">
            <MysticMagneticButton
              type="button"
              variant="secondary"
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('location')}
            >
              Back
            </MysticMagneticButton>
            <MysticMagneticButton
              type="button"
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('review')}
            >
              Continue
            </MysticMagneticButton>
          </div>
        </section>
      )}

      {step === 'review' && quote && scheduledAt && (
        <section className="mt-8 space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="font-medium">
              {MYSTIC_SERVICES.find((s) => s.id === serviceId)?.name} ·{' '}
              {scheduledAt.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-1 text-sm text-muted">
              {address.line1}, {address.city}
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Service + surcharges</span>
                <span>{formatUsd(quote.totalCents - tipCents)}</span>
              </li>
              {quote.surcharges.map((line) => (
                <li key={line.code} className="flex justify-between text-muted">
                  <span>{line.label}</span>
                  <span>{formatUsd(line.amountCents)}</span>
                </li>
              ))}
            </ul>
            <label className="mt-4 block text-sm">Tip</label>
            <select
              value={tipCents}
              onChange={(e) => setTipCents(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-2"
            >
              <option value={0}>No tip</option>
              <option value={1000}>$10</option>
              <option value={1500}>$15</option>
              <option value={2000}>$20</option>
            </select>
            <p className="mt-4 flex justify-between border-t border-line pt-4 font-medium">
              <span>Total</span>
              <span>{formatUsd(quote.totalCents)}</span>
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-paper p-5 text-sm">
            {HOUSE_CALL_POLICIES.map((policy) => (
              <div key={policy.id}>
                <p className="font-medium">{policy.title}</p>
                <p className="text-muted">{policy.body}</p>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={policiesAccepted}
              onChange={(e) => setPoliciesAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>I agree to house-call policies and SMS updates (opt out in profile).</span>
          </label>

          {error ? (
            <Alert variant="error" className="text-sm">
              {error}
            </Alert>
          ) : null}

          <MysticSecureBookingLine className="px-1" />

          <div className="flex gap-3">
            <MysticMagneticButton
              type="button"
              variant="secondary"
              className="min-w-0 flex-1"
              fullWidth
              onClick={() => setStep('details')}
            >
              Back
            </MysticMagneticButton>
            <MysticMagneticButton
              type="button"
              disabled={!policiesAccepted || submitting}
              aria-busy={submitting}
              className="min-w-0 flex-1"
              fullWidth
              onClick={payAndBook}
            >
              {submitting ? 'Redirecting…' : 'Pay with Stripe'}
            </MysticMagneticButton>
          </div>
        </section>
      )}
    </div>
  );
}
