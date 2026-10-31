'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  APPOINTMENT_TAGS,
  DEFAULT_SURCHARGE_RULES,
  HOUSE_CALL_POLICIES,
  MYSTIC_RIVER_NORTH,
  MYSTIC_SERVICES,
  computeBookingQuote,
  distanceFromRiverNorthMiles,
  isWithinHouseCallServiceArea,
  houseCallDistanceOutOfAreaMessage,
  type AddressSuggestion,
  formatUsd,
  formatVisitWhen,
  type AppointmentTagId,
  toggleAppointmentTag,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticBookStepProgress } from '@/components/mystic/book/MysticBookStepProgress';
import { fetchGeocodedDistance } from '@/lib/mystic/client-geocode';
import { uploadInspoPhotosForAppointment } from '@/lib/mystic/inspo-upload';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import {
  MysticAddressLookup,
  type HouseCallAddress,
} from '@/components/mystic/book/MysticAddressLookup';
import { MysticBookDateStrip } from '@/components/mystic/book/MysticBookDateStrip';
import {
  mysticFlatRow,
  mysticInput,
  mysticLiveHighlight,
  mysticTimeChip,
} from '@/components/mystic/mystic-styles';
import { MysticSecureBookingLine } from '@/components/mystic/MysticSecureBookingLine';
import { MysticSummaryRowGroup } from '@/components/mystic/MysticSummaryRowGroup';
import { Alert } from '@template/ui';

export function BookFlowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<BookingFlowStep>('service');
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
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
  const checkoutIdempotencyKey = useRef<string | null>(null);
  const [address, setAddress] = useState<HouseCallAddress>({
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
    if (searchParams.get('canceled') !== '1') return;
    let active = true;
    void (async () => {
      const res = await fetch('/api/mystic/appointments/release-checkout', { method: 'POST' });
      if (!active) return;
      checkoutIdempotencyKey.current = null;
      setError(
        res.ok
          ? 'Checkout canceled — your hold was released. Choose a time and try again when you are ready.'
          : 'Checkout canceled — we could not release your hold automatically. Refresh or message Luke if the slot still looks taken.'
      );
      router.replace('/book');
    })();
    return () => {
      active = false;
    };
  }, [router, searchParams]);

  function applyGeocodeResult(geo: {
    distanceMiles: number;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
  }) {
    setDistanceMiles(geo.distanceMiles);
    const suffix = geo.formattedAddress ? ` · ${geo.formattedAddress}` : '';
    setDistanceNote(
      `${geo.distanceMiles.toFixed(1)} mi from ${MYSTIC_RIVER_NORTH.label} (auto)${suffix}`
    );
    if (geo.latitude != null && geo.longitude != null) {
      setAddress((current) => ({
        ...current,
        latitude: geo.latitude,
        longitude: geo.longitude,
      }));
    }
  }

  function onAddressSuggestion(s: AddressSuggestion) {
    const miles = distanceFromRiverNorthMiles(s.latitude, s.longitude);
    if (!isWithinHouseCallServiceArea(miles)) {
      setDistanceNote(houseCallDistanceOutOfAreaMessage(miles));
      setDistanceMiles(miles);
      return;
    }
    setAddress((current) => ({
      ...current,
      line1: s.line1,
      city: s.city,
      state: s.state,
      postalCode: s.postalCode,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    applyGeocodeResult({
      distanceMiles: miles,
      formattedAddress: s.label,
      latitude: s.latitude,
      longitude: s.longitude,
    });
  }

  useEffect(() => {
    if (!address.line1 || address.state.length !== 2 || address.postalCode.length < 5) return;
    const timer = setTimeout(() => {
      setGeocodeBusy(true);
      void fetchGeocodedDistance({
        line1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        notes: address.notes,
      })
        .then((geo) =>
          applyGeocodeResult({
            distanceMiles: geo.distanceMiles,
            formattedAddress: geo.formattedAddress,
            latitude: geo.latitude,
            longitude: geo.longitude,
          })
        )
        .catch((err: Error) => setDistanceNote(err.message))
        .finally(() => setGeocodeBusy(false));
    }, 600);
    return () => clearTimeout(timer);
  }, [address.line1, address.city, address.state, address.postalCode, address.notes]);

  useEffect(() => {
    if (!date) return;
    void fetch(`/api/mystic/availability?date=${date}&serviceId=${serviceId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setSlotsError(data.error ?? 'Could not load times');
          setSlots([]);
          setTime('');
          return;
        }
        setSlotsError(null);
        const list = data.slots ?? [];
        setSlots(list);
        setTime((prev) => (list.includes(prev) ? prev : (list[0] ?? '')));
      })
      .catch(() => {
        setSlotsError('Network error loading availability');
        setSlots([]);
      });
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

  const distanceVerified = !geocodeBusy && Boolean(distanceNote?.includes('(auto)'));
  const distanceOutOfArea = distanceVerified && !isWithinHouseCallServiceArea(distanceMiles);

  function toggleTag(id: AppointmentTagId) {
    setTags((current) => toggleAppointmentTag(current, id));
  }

  async function payAndBook() {
    if (!quote || !scheduledAt) return;
    if (!isWithinHouseCallServiceArea(distanceMiles)) {
      setError(houseCallDistanceOutOfAreaMessage(distanceMiles));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (!checkoutIdempotencyKey.current) {
        checkoutIdempotencyKey.current = crypto.randomUUID();
      }
      const payload = {
        serviceId,
        scheduledAt: scheduledAt.toISOString(),
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          notes: address.notes || undefined,
          ...(address.latitude != null && address.longitude != null
            ? { latitude: address.latitude, longitude: address.longitude }
            : {}),
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
        idempotencyKey: checkoutIdempotencyKey.current,
      };

      const res = await fetch('/api/mystic/checkout/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': checkoutIdempotencyKey.current,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=${encodeURIComponent('/book')}`);
          return;
        }
        if (res.status === 409) {
          setError(data.error ?? 'Checkout already in progress');
        } else {
          setError(data.error ?? 'Checkout failed');
        }
        return;
      }
      checkoutIdempotencyKey.current = null;
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
      <MysticPageIntro
        eyebrow="Reserve"
        title="Book a house call"
        description="Choose your service, time, and address — Luke comes to you in Chicago."
        className="max-w-none"
      />
      <MysticBookStepProgress step={step} onStepChange={setStep} />

      {step === 'service' && (
        <section className="w-full divide-y divide-line/80 border-y border-line/80">
          {MYSTIC_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              aria-pressed={serviceId === service.id}
              onClick={() => setServiceId(service.id)}
              className={`${mysticFlatRow} w-full text-left ${
                serviceId === service.id ? mysticLiveHighlight : 'hover:bg-surface/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <MysticServiceIllustration serviceId={service.id} size="sm" />
                <div className="flex min-w-0 flex-1 justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{service.name}</p>
                    <p className="mt-1 text-sm text-muted">{service.description}</p>
                  </div>
                  <p className="shrink-0 font-medium">{formatUsd(service.priceCents)}</p>
                </div>
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
        <section className="w-full space-y-4">
          <label className="block text-sm font-medium">Date</label>
          <MysticBookDateStrip
            value={date}
            onChange={(iso) => {
              setDate(iso);
              setTime('');
            }}
          />
          <label className="block text-sm font-medium">Time</label>
          {slotsError ? <p className="text-sm text-danger">{slotsError}</p> : null}
          {date && !slotsError && slots.length === 0 ? (
            <MysticEmptyState variant="book-slots" compact className="mb-4" />
          ) : null}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(slots.length ? slots : !date ? ['10:00', '12:00', '15:00'] : []).map((slot) => (
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
        <section className="w-full space-y-4">
          <MysticAddressLookup
            address={address}
            onChange={setAddress}
            onSuggestionSelected={onAddressSuggestion}
          />
          <p className="text-sm font-medium">Travel distance</p>
          <p
            className={`text-sm ${distanceOutOfArea ? 'text-danger' : 'text-muted'}`}
            role={distanceOutOfArea ? 'alert' : undefined}
          >
            {geocodeBusy
              ? 'Calculating from your address…'
              : distanceOutOfArea
                ? houseCallDistanceOutOfAreaMessage(distanceMiles)
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
              disabled={
                !address.line1 ||
                address.state.length !== 2 ||
                address.postalCode.length < 5 ||
                geocodeBusy ||
                !distanceVerified ||
                distanceOutOfArea ||
                Boolean(distanceNote?.includes('not found'))
              }
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
        <section className="w-full space-y-4">
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
            maxLength={16}
            placeholder="Referral code (optional)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-line px-4 py-3"
          />
          <input
            maxLength={120}
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
        <section className="w-full space-y-4 pb-28">
          <MysticSummaryRowGroup
            rows={[
              {
                id: 'service',
                label: 'Service',
                value: MYSTIC_SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId,
                onEdit: () => setStep('service'),
              },
              {
                id: 'when',
                label: 'When',
                value: formatVisitWhen(scheduledAt.toISOString()),
                onEdit: () => setStep('datetime'),
              },
              {
                id: 'where',
                label: 'Where',
                value: `${address.line1}, ${address.city}, ${address.state}`,
                hint: address.notes || undefined,
                onEdit: () => setStep('location'),
              },
              {
                id: 'details',
                label: 'Details',
                value:
                  tags.length > 0
                    ? tags
                        .map((t) => APPOINTMENT_TAGS.find((a) => a.id === t)?.label ?? t)
                        .join(' · ')
                    : 'No extra preferences',
                hint: referredBy || referralCode ? 'Referral noted' : undefined,
                onEdit: () => setStep('details'),
              },
            ]}
          />
          <div className={`${mysticFlatRow} border-t border-line/80 pt-6`}>
            <p className="type-eyebrow text-plum">Payment</p>
            <ul className="mt-3 space-y-1 text-sm">
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

          <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl border border-line/80 bg-surface/95 p-3 shadow-[0_12px_40px_-16px_rgba(26,31,24,0.35)] backdrop-blur-md">
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
                disabled={!policiesAccepted || submitting || distanceOutOfArea}
                aria-busy={submitting}
                className="min-w-0 flex-1"
                fullWidth
                onClick={payAndBook}
              >
                {submitting ? 'Redirecting…' : 'Pay with Stripe'}
              </MysticMagneticButton>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
