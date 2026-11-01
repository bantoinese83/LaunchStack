'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  formatBookingSlotLabel,
  scheduledAtFromBookingSlot,
  inferClientEntitlementFromCredits,
  clientEntitlementSummary,
  shouldShowBookingPlansNudge,
  BOOKING_PLANS_NUDGE,
  type MysticCreditRow,
  bookingSubtotalBeforeTip,
  buildTipChoiceFromUi,
  formatTipPresetLabel,
  resolveBookingTipCents,
  type AppointmentTagId,
  toggleAppointmentTag,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { MysticAiOrb } from '@/components/mystic/MysticAiOrb';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticBookStepProgress } from '@/components/mystic/book/MysticBookStepProgress';
import { fetchGeocodedDistance } from '@/lib/mystic/client-geocode';
import { uploadInspoPhotosForAppointment } from '@/lib/mystic/inspo-upload';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import {
  MysticAddressLookup,
  type HouseCallAddress,
} from '@/components/mystic/book/MysticAddressLookup';
import { MysticBookDateStrip } from '@/components/mystic/book/MysticBookDateStrip';
import { mysticLiveHighlight, mysticTimeChip } from '@/components/mystic/mystic-styles';
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
  const [tipPreset, setTipPreset] = useState<'none' | 15 | 18 | 20 | 'custom'>('none');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [customTipDollars, setCustomTipDollars] = useState('');
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
  const [conciergePrompt, setConciergePrompt] = useState('');
  const [conciergeBusy, setConciergeBusy] = useState(false);
  const [conciergeHint, setConciergeHint] = useState<string | null>(null);
  const [conciergeExtras, setConciergeExtras] = useState<{
    clarifyingQuestion?: string;
    alternatives?: { serviceId: string; serviceName?: string; why: string }[];
    confidence?: string;
  } | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null | undefined>(undefined);
  const [slotsReloadToken, setSlotsReloadToken] = useState(0);
  const [myCredits, setMyCredits] = useState<MysticCreditRow[]>([]);

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
    void fetch('/api/mystic/credits/mine')
      .then((r) => (r.ok ? r.json() : { credits: [] }))
      .then((data) => setMyCredits(Array.isArray(data.credits) ? data.credits : []))
      .catch(() => setMyCredits([]));
  }, []);

  const inferredEntitlement = useMemo(
    () => inferClientEntitlementFromCredits(myCredits, serviceId),
    [myCredits, serviceId]
  );

  useEffect(() => {
    setEntitlement(inferredEntitlement);
  }, [inferredEntitlement]);

  useEffect(() => {
    void fetch('/api/mystic/client-profile')
      .then(async (r) => {
        if (!r.ok) {
          setProfilePhone(null);
          return;
        }
        const data = await r.json();
        const phone = typeof data.profile?.phone === 'string' ? data.profile.phone.trim() : '';
        setProfilePhone(phone || null);
      })
      .catch(() => setProfilePhone(null));
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
  }, [date, serviceId, slotsReloadToken]);

  const scheduledAt = useMemo(() => {
    if (!date || !time) return null;
    const at = scheduledAtFromBookingSlot(date, time);
    return Number.isNaN(at.getTime()) ? null : at;
  }, [date, time]);

  const quoteWithoutTip = useMemo(() => {
    if (!scheduledAt) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles,
      entitlement,
      tipCents: 0,
      rules: surchargeRules ?? undefined,
    });
  }, [scheduledAt, serviceId, distanceMiles, entitlement, surchargeRules]);

  const tipSubtotalCents = quoteWithoutTip ? bookingSubtotalBeforeTip(quoteWithoutTip) : 0;

  const tipCents = useMemo(() => {
    if (!quoteWithoutTip) return 0;
    return resolveBookingTipCents(
      tipSubtotalCents,
      buildTipChoiceFromUi({
        preset: tipPreset,
        customPercent: customTipPercent,
        customDollars: customTipDollars,
      })
    );
  }, [quoteWithoutTip, tipSubtotalCents, tipPreset, customTipPercent, customTipDollars]);

  const quote = useMemo(() => {
    if (!quoteWithoutTip) return null;
    return {
      ...quoteWithoutTip,
      tipCents,
      totalCents: tipSubtotalCents + tipCents,
    };
  }, [quoteWithoutTip, tipCents, tipSubtotalCents]);

  const distanceVerified = !geocodeBusy && Boolean(distanceNote?.includes('(auto)'));
  const distanceOutOfArea = distanceVerified && !isWithinHouseCallServiceArea(distanceMiles);

  function toggleTag(id: AppointmentTagId) {
    setTags((current) => toggleAppointmentTag(current, id));
  }

  async function askConcierge() {
    const prompt = conciergePrompt.trim();
    if (prompt.length < 4) {
      setConciergeHint('Tell us the occasion or look in a sentence.');
      return;
    }
    setConciergeBusy(true);
    setConciergeHint(null);
    setConciergeExtras(null);
    try {
      const res = await fetch('/api/mystic/ai/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConciergeHint(data.error ?? 'Could not recommend a service');
        return;
      }
      setServiceId(data.serviceId as ServiceId);
      if (Array.isArray(data.suggestedTags) && data.suggestedTags.length) {
        setTags((current) => {
          let next = current;
          for (const id of data.suggestedTags as AppointmentTagId[]) {
            if (!next.includes(id)) next = toggleAppointmentTag(next, id);
          }
          return next;
        });
      }
      setConciergeHint(`${data.serviceName}: ${data.reason}${data.tip ? ` — ${data.tip}` : ''}`);
      setConciergeExtras({
        clarifyingQuestion: data.clarifyingQuestion,
        alternatives: data.alternatives,
        confidence: data.confidence,
      });
    } catch {
      setConciergeHint('Network error — pick a service below');
    } finally {
      setConciergeBusy(false);
    }
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
        <section className="w-full space-y-6">
          <div className="space-y-3 rounded-2xl bg-accent-soft/40 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <MysticAiOrb active={conciergeBusy} size="sm" label="Booking concierge" />
              <div>
                <p className="type-eyebrow text-plum">Not sure? Ask the concierge</p>
                <p className="mt-0.5 text-xs text-muted">
                  Describe the look — I’ll match a service.
                </p>
              </div>
            </div>
            <textarea
              value={conciergePrompt}
              onChange={(e) => setConciergePrompt(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder="Wedding guest, soft waves, 45 minutes before photos…"
              className="min-h-[4.5rem] w-full resize-y rounded-xl bg-paper/80 px-3 py-3 text-sm text-ink outline-none ring-0 placeholder:text-muted focus:bg-paper"
            />
            <button
              type="button"
              disabled={conciergeBusy}
              onClick={() => void askConcierge()}
              className="text-sm font-medium text-accent underline disabled:opacity-50"
            >
              {conciergeBusy ? 'Matching…' : 'Recommend a service'}
            </button>
            {conciergeHint ? <p className="text-sm text-muted">{conciergeHint}</p> : null}
            {conciergeExtras?.clarifyingQuestion ? (
              <p className="text-sm text-plum">
                Still unsure? {conciergeExtras.clarifyingQuestion}
              </p>
            ) : null}
            {conciergeExtras?.alternatives && conciergeExtras.alternatives.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {conciergeExtras.alternatives.map((alt) => (
                  <button
                    key={alt.serviceId}
                    type="button"
                    onClick={() => setServiceId(alt.serviceId as ServiceId)}
                    className="rounded-xl bg-paper/70 px-3 py-2 text-left text-xs text-ink transition hover:bg-paper"
                  >
                    <span className="font-medium text-accent">
                      Or {alt.serviceName ?? alt.serviceId}
                    </span>
                    <span className="text-muted"> — {alt.why}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {MYSTIC_SERVICES.map((service) => {
              const selected = serviceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setServiceId(service.id)}
                  className={`group flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
                    selected
                      ? `${mysticLiveHighlight} shadow-[0_10px_28px_-18px_rgba(196,169,98,0.9)]`
                      : 'bg-surface hover:-translate-y-0.5 hover:bg-accent-soft/50'
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <MysticServiceIllustration serviceId={service.id} size="sm" />
                    <span className="rounded-full bg-paper/80 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted">
                      {service.durationMinutes}m
                    </span>
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="font-medium text-ink">{service.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">
                      {formatUsd(service.priceCents)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <MysticMagneticButton type="button" onClick={() => setStep('datetime')} fullWidth>
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
          {!date ? <p className="text-sm text-muted">Pick a date to see open times.</p> : null}
          {slotsError ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-danger">{slotsError}</p>
              <button
                type="button"
                className="text-sm font-medium text-accent underline"
                onClick={() => setSlotsReloadToken((n) => n + 1)}
              >
                Retry
              </button>
            </div>
          ) : null}
          {date && !slotsError && slots.length === 0 ? (
            <div className="space-y-3">
              <MysticEmptyState variant="book-slots" compact className="mb-0" />
              <button
                type="button"
                className="text-sm font-medium text-accent underline"
                onClick={() => {
                  if (!date) return;
                  const next = new Date(`${date}T12:00:00`);
                  next.setDate(next.getDate() + 1);
                  setDate(next.toISOString().slice(0, 10));
                  setTime('');
                }}
              >
                Try tomorrow
              </button>
            </div>
          ) : null}
          {date && slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={time === slot}
                  onClick={() => setTime(slot)}
                  className={mysticTimeChip(time === slot)}
                >
                  {formatBookingSlotLabel(slot)}
                </button>
              ))}
            </div>
          ) : null}
          {clientEntitlementSummary(entitlement) ? (
            <p className="rounded-xl bg-gold-soft/60 px-4 py-3 text-sm text-ink">
              {clientEntitlementSummary(entitlement)}
            </p>
          ) : shouldShowBookingPlansNudge(serviceId, entitlement) ? (
            <div className="space-y-3 rounded-xl border border-accent/25 bg-accent-soft/50 px-4 py-3">
              <div>
                <p className="font-medium text-ink">{BOOKING_PLANS_NUDGE.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {BOOKING_PLANS_NUDGE.body}
                </p>
              </div>
              <MysticMagneticLink href="/memberships" variant="secondary" size="sm">
                {BOOKING_PLANS_NUDGE.cta}
              </MysticMagneticLink>
              <p className="text-xs text-muted">
                You can keep booking now — fees below apply to this visit.
              </p>
            </div>
          ) : serviceId !== 'blowout' ? (
            <p className="text-sm text-muted">
              Membership and package credits apply to blowouts only — this service is menu price
              plus any travel or evening fees.
            </p>
          ) : (
            <p className="text-sm text-muted">
              Evening and travel fees may apply when you book outside a membership or package.
            </p>
          )}
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
            className="min-h-24 w-full rounded-xl bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:bg-accent-soft/40"
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
                className={`rounded-full px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 ${
                  tags.includes(tag.id)
                    ? 'bg-accent text-paper'
                    : 'bg-surface text-muted hover:bg-accent-soft hover:text-ink'
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
            className="w-full rounded-xl bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:bg-accent-soft/40"
          />
          <input
            maxLength={120}
            placeholder="Or referred by (first & last name)"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            className="w-full rounded-xl bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:bg-accent-soft/40"
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
                hint:
                  referredBy || referralCode ? 'Referral will be checked at checkout' : undefined,
                onEdit: () => setStep('details'),
              },
            ]}
          />
          {shouldShowBookingPlansNudge(serviceId, entitlement) && quote.surcharges.length > 0 ? (
            <div className="rounded-xl border border-accent/25 bg-accent-soft/40 px-4 py-3 text-sm">
              <p className="font-medium text-ink">{BOOKING_PLANS_NUDGE.title}</p>
              <p className="mt-1 text-muted">
                This visit includes travel or evening fees — members and package holders skip those
                on blowouts.
              </p>
              <MysticMagneticLink
                href="/memberships"
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                {BOOKING_PLANS_NUDGE.cta}
              </MysticMagneticLink>
            </div>
          ) : null}
          <div className="rounded-2xl bg-surface p-5">
            <p className="type-eyebrow text-plum">Payment</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between gap-3">
                <span>Service + surcharges</span>
                <span className="tabular-nums">{formatUsd(quote.totalCents - tipCents)}</span>
              </li>
              {quote.surcharges.map((line) => (
                <li key={line.code} className="flex justify-between gap-3 text-muted">
                  <span>{line.label}</span>
                  <span className="tabular-nums">{formatUsd(line.amountCents)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium">Tip</p>
            <p className="text-xs text-muted">Based on service + surcharges before tip.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {([15, 18, 20] as const).map((percent) => (
                <button
                  key={percent}
                  type="button"
                  aria-pressed={tipPreset === percent}
                  onClick={() => {
                    setTipPreset(percent);
                    setCustomTipPercent('');
                    setCustomTipDollars('');
                  }}
                  className={mysticTimeChip(tipPreset === percent)}
                >
                  {formatTipPresetLabel(percent, tipSubtotalCents)}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={tipPreset === 'custom'}
                onClick={() => setTipPreset('custom')}
                className={mysticTimeChip(tipPreset === 'custom')}
              >
                Custom
              </button>
              <button
                type="button"
                aria-pressed={tipPreset === 'none'}
                onClick={() => {
                  setTipPreset('none');
                  setCustomTipPercent('');
                  setCustomTipDollars('');
                }}
                className={mysticTimeChip(tipPreset === 'none')}
              >
                No tip
              </button>
            </div>
            {tipPreset === 'custom' ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-muted">Custom %</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customTipPercent}
                    onChange={(e) => {
                      setCustomTipDollars('');
                      setCustomTipPercent(e.target.value);
                    }}
                    placeholder="e.g. 22"
                    className="mt-1 w-full rounded-xl bg-paper px-4 py-2.5 text-ink outline-none"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted">Or custom amount</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customTipDollars}
                    onChange={(e) => {
                      setCustomTipPercent('');
                      setCustomTipDollars(e.target.value);
                    }}
                    placeholder="e.g. 15.00"
                    className="mt-1 w-full rounded-xl bg-paper px-4 py-2.5 text-ink outline-none"
                  />
                </label>
              </div>
            ) : null}
            {tipCents > 0 ? (
              <p className="mt-2 text-sm text-muted">
                Tip total: <span className="tabular-nums text-ink">{formatUsd(tipCents)}</span>
              </p>
            ) : null}
            <p className="mt-3 flex justify-between gap-3 text-sm text-muted">
              <span>Refundable booking deposit</span>
              <span className="tabular-nums">{formatUsd(depositCents)}</span>
            </p>
            <p className="mt-4 flex justify-between gap-3 rounded-xl bg-gold-soft/80 px-3 py-3 font-medium">
              <span>Total due now</span>
              <span className="tabular-nums">{formatUsd(quote.totalCents)}</span>
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-paper/80 p-5 text-sm">
            {HOUSE_CALL_POLICIES.map((policy) => (
              <div key={policy.id}>
                <p className="font-medium text-ink">{policy.title}</p>
                <p className="mt-0.5 leading-relaxed text-muted">{policy.body}</p>
              </div>
            ))}
          </div>

          {profilePhone === null ? (
            <Alert variant="info" className="text-sm">
              Add a mobile number in{' '}
              <Link href="/account" className="font-medium underline underline-offset-2">
                Account
              </Link>{' '}
              so you get on-the-way and arrival texts. You can still pay now.
            </Alert>
          ) : null}

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

          <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl bg-surface/95 p-3 shadow-[0_16px_48px_-20px_rgba(26,31,24,0.4)] backdrop-blur-md">
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
