'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  APPOINTMENT_TAGS,
  DEFAULT_SURCHARGE_RULES,
  HOUSE_CALL_POLICIES,
  MYSTIC_RIVER_NORTH,
  MYSTIC_SERVICES,
  computeBookingQuote,
  formatUsd,
  formatVisitWhen,
  type AppointmentTagId,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticBookStepProgress } from '@/components/mystic/book/MysticBookStepProgress';
import { fetchGeocodedDistance } from '@/lib/mystic/client-geocode';
import { uploadInspoPhotosForAppointment } from '@/lib/mystic/inspo-upload';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticBookDateStrip } from '@/components/mystic/book/MysticBookDateStrip';
import { mysticCard, mysticInput, mysticTimeChip } from '@/components/mystic/mystic-styles';
import { MysticSecureBookingLine } from '@/components/mystic/MysticSecureBookingLine';
import { Alert } from '@template/ui';

export function BookFlowClient() {
  const router = useRouter();
  const [step, setStep] = useState<BookingFlowStep>('service');
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [distanceMiles, setDistanceMiles] = useState(3);
  const [distanceNote, setDistanceNote] = useState<string | null>(null);
  const [geocodeBusy, setGeocodeBusy] = useState(false);
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
  const [surchargeRules, setSurchargeRules] = useState<SurchargeRules | null>(null);
  const [depositCents, setDepositCents] = useState(2500);
  const [inspoFiles, setInspoFiles] = useState<File[]>([]);

  useEffect(() => {
    void fetch('/api/mystic/public/booking-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.rules) setSurchargeRules(data.rules);
        if (typeof data.depositCents === 'number') setDepositCents(data.depositCents);
      })
      .catch(() => setSurchargeRules(null));
  }, []);

  useEffect(() => {
    if (!address.line1 || address.postalCode.length < 5) return;
    const timer = setTimeout(() => {
      setGeocodeBusy(true);
      void fetchGeocodedDistance({
        line1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        notes: address.notes,
      })
        .then((geo) => {
          setDistanceMiles(geo.distanceMiles);
          setDistanceNote(
            `${geo.distanceMiles.toFixed(1)} mi from ${MYSTIC_RIVER_NORTH.label} (auto)`
          );
        })
        .catch((err: Error) => setDistanceNote(err.message))
        .finally(() => setGeocodeBusy(false));
    }, 600);
    return () => clearTimeout(timer);
  }, [address.line1, address.city, address.state, address.postalCode]);

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
      rules: surchargeRules ?? undefined,
    });
  }, [scheduledAt, serviceId, distanceMiles, entitlement, tipCents, surchargeRules]);

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
      const appointmentId = data.appointmentId as string | undefined;
      if (appointmentId && inspoFiles.length > 0) {
        await uploadInspoPhotosForAppointment(appointmentId, inspoFiles);
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
      <MysticBookStepProgress step={step} onStepChange={setStep} />

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
          {date && slots.length === 0 ? (
            <MysticEmptyState variant="book-slots" compact className="mb-4" />
          ) : null}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(slots.length ? slots : date ? [] : ['10:00', '12:00', '15:00']).map((slot) => (
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
          <p className="text-sm font-medium">Travel distance</p>
          <p className="text-sm text-muted">
            {geocodeBusy
              ? 'Calculating from your address…'
              : (distanceNote ??
                `We estimate miles from ${MYSTIC_RIVER_NORTH.label} when you enter street + ZIP.`)}
          </p>
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
          <div>
            <p className="text-sm font-medium">Inspo photos (optional, up to 4)</p>
            <p className="text-xs text-muted">
              Luke preps products before arrival — you can add more on My visits later.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-2 w-full text-sm"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []).slice(
                  0,
                  DEFAULT_SURCHARGE_RULES.maxInspoPhotos
                );
                setInspoFiles(list);
              }}
            />
            {inspoFiles.length > 0 ? (
              <p className="mt-1 text-xs text-muted">
                {inspoFiles.length} photo(s) ready to upload
              </p>
            ) : null}
          </div>
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
              {formatVisitWhen(scheduledAt.toISOString())}
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
            <p className="mt-2 flex justify-between text-sm text-muted">
              <span>Refundable hold (no-show / door timer)</span>
              <span>{formatUsd(depositCents)}</span>
            </p>
            <p className="mt-4 flex justify-between border-t border-line pt-4 font-medium">
              <span>Total due now</span>
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
