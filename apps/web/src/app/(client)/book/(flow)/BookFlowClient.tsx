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
  availableBookingEntitlements,
  clientEntitlementSummary,
  BOOKING_ENTITLEMENT_LABEL,
  shouldShowBookingPlansNudge,
  BOOKING_PLANS_NUDGE,
  BOOK_FLOW_COPY,
  MYSTIC_REFERRAL_SHARE,
  referralCodeForCheckout,
  type MysticCreditRow,
  bookingSubtotalBeforeTip,
  buildTipChoiceFromUi,
  formatTipPresetLabel,
  resolveBookingTipCents,
  type AppointmentTagId,
  toggleAppointmentTag,
  defaultBookingDateIso,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { MysticPayWithStripeLabel } from '@/components/mystic/MysticStripeWordmark';
import { MysticBookingCopilot } from '@/components/mystic/book/MysticBookingCopilot';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import { MysticBookServiceFlipCard } from '@/components/mystic/book/MysticBookServiceFlipCard';
import { MysticBookStepBreadcrumb } from '@/components/mystic/book/MysticBookStepBreadcrumb';
import { MysticBookStepProgress } from '@/components/mystic/book/MysticBookStepProgress';
import { MysticBookEntitlementPicker } from '@/components/mystic/book/MysticBookEntitlementPicker';
import { fetchGeocodedDistance } from '@/lib/mystic/client-geocode';
import { uploadInspoPhotosForAppointment } from '@/lib/mystic/inspo-upload';
import { MysticMagneticButton, MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import {
  MysticAddressLookup,
  type HouseCallAddress,
} from '@/components/mystic/book/MysticAddressLookup';
import { MysticBookDateStrip } from '@/components/mystic/book/MysticBookDateStrip';
import { MysticBookStepActions } from '@/components/mystic/book/MysticBookStepActions';
import { MysticBookTripSummary } from '@/components/mystic/book/MysticBookTripSummary';
import { MysticBookPlansPromo } from '@/components/mystic/book/MysticBookPlansPromo';
import { mysticTimeChip } from '@/components/mystic/mystic-styles';
import { MysticSecureBookingLine } from '@/components/mystic/MysticSecureBookingLine';
import { MysticSummaryRowGroup } from '@/components/mystic/MysticSummaryRowGroup';
import { Alert } from '@template/ui';
import { useReferralAttribution } from '@/hooks/useReferralAttribution';
import { useValidatedReferralCode } from '@/hooks/useValidatedReferralCode';
import { clearReferralAttribution } from '@/lib/mystic/referral-storage';
import { parseBookServiceParam } from '@/lib/mystic/book-links';
import { useDeferredEffect } from '@/lib/react/useDeferredEffect';

export function BookFlowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { referralCode } = useReferralAttribution();
  const { referralApplied } = useValidatedReferralCode(referralCode);
  const checkoutReferralCode = referralApplied ? referralCode : null;
  const [step, setStep] = useState<BookingFlowStep>('service');
  const [serviceId, setServiceId] = useState<ServiceId>(
    () => parseBookServiceParam(searchParams.get('service')) ?? 'blowout'
  );
  const [date, setDate] = useState(() => defaultBookingDateIso());
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [distanceMiles, setDistanceMiles] = useState(3);
  const [distanceNote, setDistanceNote] = useState<string | null>(null);
  const [geocodeBusy, setGeocodeBusy] = useState(false);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [tags, setTags] = useState<AppointmentTagId[]>([]);
  const [referredBy, setReferredBy] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [tipPreset, setTipPreset] = useState<'none' | 'cash' | 18 | 20 | 25 | 'custom'>('none');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [customTipDollars, setCustomTipDollars] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const checkoutIdempotencyKey = useRef<string | null>(null);
  const entitlementTouched = useRef(false);
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
  const [menuPriceCents, setMenuPriceCents] = useState<Partial<Record<ServiceId, number>>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscountCents, setPromoDiscountCents] = useState(0);
  const appliedPromoDiscountCents = promoCode.trim() ? promoDiscountCents : 0;

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

  useEffect(() => {
    void fetch('/api/mystic/catalog')
      .then((r) => r.json())
      .then((data) => {
        const map: Partial<Record<ServiceId, number>> = {};
        for (const s of data.services ?? []) {
          map[s.id as ServiceId] = s.priceCents;
        }
        setMenuPriceCents(map);
      })
      .catch(() => undefined);
  }, []);

  const inferredEntitlement = useMemo(
    () => inferClientEntitlementFromCredits(myCredits, serviceId),
    [myCredits, serviceId]
  );

  const entitlementOptions = useMemo(
    () => availableBookingEntitlements(myCredits, serviceId),
    [myCredits, serviceId]
  );

  const activeEntitlement = useMemo(
    () =>
      entitlementOptions.includes(entitlement) ? entitlement : (entitlementOptions[0] ?? 'none'),
    [entitlement, entitlementOptions]
  );

  useEffect(() => {
    if (!entitlementTouched.current) setEntitlement(inferredEntitlement);
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

  useDeferredEffect(() => {
    const fromQuery = parseBookServiceParam(searchParams.get('service'));
    if (fromQuery) setServiceId(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('canceled') !== '1') return;
    let active = true;
    void (async () => {
      const res = await fetch('/api/mystic/appointments/release-checkout', { method: 'POST' });
      if (!active) return;
      checkoutIdempotencyKey.current = null;
      if (res.ok) {
        setStep('datetime');
        setError(null);
        setNotice(
          'Checkout canceled — your hold was released. Pick a time and continue when you are ready.'
        );
      } else {
        setError(
          'Checkout canceled — we could not release your hold automatically. Refresh or message Luke if the slot still looks taken.'
        );
      }
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
      entitlement: activeEntitlement,
      tipCents: 0,
      rules: surchargeRules ?? undefined,
      basePriceCents: menuPriceCents[serviceId],
      discountCents: appliedPromoDiscountCents,
    });
  }, [
    scheduledAt,
    serviceId,
    distanceMiles,
    activeEntitlement,
    surchargeRules,
    menuPriceCents,
    appliedPromoDiscountCents,
  ]);

  useEffect(() => {
    if (!promoCode.trim() || !scheduledAt) return;
    let cancelled = false;
    const draft = computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles,
      entitlement: activeEntitlement,
      tipCents: 0,
      rules: surchargeRules ?? undefined,
      basePriceCents: menuPriceCents[serviceId],
    });
    const subtotal = draft.baseCents + draft.surcharges.reduce((s, l) => s + l.amountCents, 0);
    void fetch(
      `/api/mystic/promo/preview?code=${encodeURIComponent(promoCode)}&subtotalCents=${subtotal}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPromoDiscountCents(data.valid ? data.discountCents : 0);
      })
      .catch(() => {
        if (!cancelled) setPromoDiscountCents(0);
      });
    return () => {
      cancelled = true;
    };
  }, [
    promoCode,
    scheduledAt,
    serviceId,
    distanceMiles,
    activeEntitlement,
    surchargeRules,
    menuPriceCents,
  ]);

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
      totalCents: quoteWithoutTip.totalCents + tipCents,
    };
  }, [quoteWithoutTip, tipCents]);

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
        entitlement: activeEntitlement,
        quoteCents:
          activeEntitlement !== 'none' && serviceId === 'blowout' ? 0 : quote.totalCents - tipCents,
        surchargeJson: quote.surcharges,
        tipCents,
        tags,
        ...referralCodeForCheckout(checkoutReferralCode, referredBy),
        clientNotes:
          [address.notes?.trim(), tipPreset === 'cash' ? BOOK_FLOW_COPY.clientTipCashNote : null]
            .filter(Boolean)
            .join('\n') || undefined,
        policiesAccepted: true,
        ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
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
          const loginNext =
            typeof window !== 'undefined'
              ? `${window.location.pathname}${window.location.search}`
              : '/book';
          router.push(`/login?next=${encodeURIComponent(loginNext)}`);
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
      if (data.url) {
        try {
          const target = new URL(data.url, window.location.origin);
          if (target.pathname.includes('/book/success')) {
            clearReferralAttribution();
            router.push(`${target.pathname}${target.search}` as '/book/success');
            return;
          }
        } catch {
          /* fall through to full navigation */
        }
        clearReferralAttribution();
        window.location.href = data.url;
      }
    } catch {
      setError('Network error — try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full lg:grid-cols-[minmax(0,1fr)_min(17.5rem,26vw)] lg:items-start lg:gap-x-10 lg:gap-y-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-x-12">
      <div className="lg:col-span-2">
        <MysticPageIntro
          eyebrow="Reserve"
          title="Book a house call"
          description="Choose your service, time, and address — Luke comes to you in Chicago."
          className="max-w-none"
        />
        <div className="mb-6 mt-2">
          <MysticStylistChip size={42} />
        </div>
        <MysticBookStepBreadcrumb step={step} onStepChange={setStep} className="mb-4 md:mb-5" />
        <MysticBookStepProgress step={step} onStepChange={setStep} />
      </div>

      <MysticBookTripSummary
        step={step}
        serviceId={serviceId}
        scheduledAt={scheduledAt}
        addressLine1={address.line1}
        estimateCents={quoteWithoutTip ? tipSubtotalCents : null}
      />

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        {notice ? (
          <Alert variant="success" className="mb-4 text-sm">
            {notice}
          </Alert>
        ) : null}
        {step === 'service' && (
          <section className="w-full space-y-6">
            <MysticBookPlansPromo />
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
              role="listbox"
              aria-label="Choose a service"
            >
              {MYSTIC_SERVICES.map((service) => {
                const selected = serviceId === service.id;
                return (
                  <div key={service.id} role="option" aria-selected={selected} className="min-w-0">
                    <MysticBookServiceFlipCard
                      service={service}
                      selected={selected}
                      onSelect={() => setServiceId(service.id)}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted">
              Tap a card to select, or drag to flip for full details — any flip selects that
              service.
            </p>
            <MysticBookStepActions
              onBack={() => router.back()}
              onContinue={() => setStep('datetime')}
            />
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
            {scheduledAt ? (
              <p className="rounded-xl bg-gold-soft/70 px-4 py-3 text-sm text-ink">
                <span className="font-medium">Selected:</span>{' '}
                {formatVisitWhen(scheduledAt.toISOString())}
              </p>
            ) : null}
            <MysticBookEntitlementPicker
              value={activeEntitlement}
              options={entitlementOptions}
              onChange={(next) => {
                entitlementTouched.current = true;
                setEntitlement(next);
              }}
            />
            {clientEntitlementSummary(activeEntitlement) ? (
              <p className="rounded-xl bg-gold-soft/60 px-4 py-3 text-sm text-ink">
                {clientEntitlementSummary(activeEntitlement)}
              </p>
            ) : shouldShowBookingPlansNudge(serviceId, activeEntitlement) ? (
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
            <MysticBookStepActions
              onBack={() => setStep('service')}
              onContinue={() => setStep('location')}
              continueDisabled={!date || !time}
              footer={!date || !time ? 'Choose a date and time to continue.' : undefined}
            />
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
            <MysticBookStepActions
              onBack={() => setStep('datetime')}
              onContinue={() => setStep('details')}
              continueDisabled={
                !address.line1 ||
                address.state.length !== 2 ||
                address.postalCode.length < 5 ||
                geocodeBusy ||
                !distanceVerified ||
                distanceOutOfArea ||
                Boolean(distanceNote?.includes('not found'))
              }
              footer={
                geocodeBusy
                  ? 'Checking your address…'
                  : distanceOutOfArea
                    ? 'This address is outside our house-call zone.'
                    : undefined
              }
            />
          </section>
        )}

        {step === 'details' && (
          <section className="w-full space-y-4">
            <p className="type-eyebrow text-plum">{BOOK_FLOW_COPY.preferencesSection}</p>
            {referralApplied && referralCode ? (
              <div className="rounded-xl border border-plum/25 bg-gold-soft/60 px-4 py-3 text-sm">
                <p className="font-medium text-ink">{MYSTIC_REFERRAL_SHARE.appliedBadge}</p>
                <p className="mt-1 text-xs text-muted">
                  Code <span className="font-mono text-ink">{referralCode}</span> —{' '}
                  {MYSTIC_REFERRAL_SHARE.appliedHint}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={tags.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 ${
                    tags.includes(tag.id)
                      ? 'border-accent bg-accent text-paper shadow-sm'
                      : 'border-accent/20 bg-surface text-ink hover:border-accent/40 hover:bg-accent-soft/50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            {!referralApplied ? (
              <input
                maxLength={120}
                placeholder={BOOK_FLOW_COPY.referredByPlaceholder}
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full rounded-xl bg-surface px-4 py-3 text-ink outline-none placeholder:text-muted focus:bg-accent-soft/40"
              />
            ) : null}
            <div>
              <p className="text-sm font-medium">
                {BOOK_FLOW_COPY.addInspoPhotos} (optional, up to 4)
              </p>
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
            <MysticBookStepActions
              onBack={() => setStep('location')}
              onContinue={() => setStep('review')}
            />
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
                    referralApplied && referralCode
                      ? `Referral ${referralCode}`
                      : referredBy.trim()
                        ? `Referred by ${referredBy.trim()}`
                        : undefined,
                  onEdit: () => setStep('details'),
                },
              ]}
            />
            {shouldShowBookingPlansNudge(serviceId, activeEntitlement) &&
            quote.surcharges.length > 0 ? (
              <div className="rounded-xl border border-accent/25 bg-accent-soft/40 px-4 py-3 text-sm">
                <p className="font-medium text-ink">{BOOKING_PLANS_NUDGE.title}</p>
                <p className="mt-1 text-muted">
                  This visit includes travel or evening fees — members and package holders skip
                  those on blowouts.
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
            <label className="block text-sm">
              Promo code (optional)
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                placeholder="e.g. HOLIDAY20"
              />
              {appliedPromoDiscountCents > 0 ? (
                <span className="mt-1 block text-xs text-accent">
                  −{formatUsd(appliedPromoDiscountCents)} applied
                </span>
              ) : null}
            </label>
            <div className="rounded-2xl bg-surface p-5">
              <p className="type-eyebrow text-plum">Payment</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between gap-3">
                  <span>Service + surcharges</span>
                  <span className="tabular-nums">{formatUsd(quote.totalCents - tipCents)}</span>
                </li>
                {quote.discountCents > 0 ? (
                  <li className="flex justify-between gap-3 text-accent">
                    <span>Promo</span>
                    <span className="tabular-nums">−{formatUsd(quote.discountCents)}</span>
                  </li>
                ) : null}
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
                {([18, 20, 25] as const).map((percent) => (
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
                  aria-pressed={tipPreset === 'cash'}
                  onClick={() => {
                    setTipPreset('cash');
                    setCustomTipPercent('');
                    setCustomTipDollars('');
                  }}
                  className={mysticTimeChip(tipPreset === 'cash')}
                >
                  {BOOK_FLOW_COPY.tipInCash}
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
              {tipPreset === 'cash' ? (
                <p className="mt-2 text-xs text-muted">{BOOK_FLOW_COPY.tipCashNote}</p>
              ) : null}
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
                  {submitting ? (
                    'Working…'
                  ) : quote.totalCents === 0 ? (
                    'Confirm booking'
                  ) : (
                    <MysticPayWithStripeLabel />
                  )}
                </MysticMagneticButton>
              </div>
            </div>
          </section>
        )}
      </div>

      <MysticBookingCopilot
        prompt={conciergePrompt}
        onPromptChange={setConciergePrompt}
        busy={conciergeBusy}
        hint={conciergeHint}
        extras={conciergeExtras}
        onSubmit={() => void askConcierge()}
        onPickService={setServiceId}
        layout="rail"
      />
    </div>
  );
}
