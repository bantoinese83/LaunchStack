import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  APPOINTMENT_TAGS,
  BOOKING_FLOW_STEPS,
  DEFAULT_SURCHARGE_RULES,
  HOUSE_CALL_POLICIES,
  MYSTIC_RIVER_NORTH,
  MYSTIC_SERVICES,
  computeBookingQuote,
  distanceFromRiverNorthMiles,
  houseCallDistanceOutOfAreaMessage,
  isWithinHouseCallServiceArea,
  type AddressSuggestion,
  formatUsd,
  formatVisitWhen,
  formatBookingSlotLabel,
  scheduledAtFromBookingSlot,
  inferClientEntitlementFromCredits,
  availableBookingEntitlements,
  clientEntitlementSummary,
  shouldShowBookingPlansNudge,
  BOOKING_PLANS_NUDGE,
  BOOK_FLOW_COPY,
  MYSTIC_REFERRAL_SHARE,
  MYSTIC_REFERRAL_QUERY_PARAM,
  referralCodeForCheckout,
  type MysticCreditRow,
  bookingSubtotalBeforeTip,
  buildTipChoiceFromUi,
  formatTipPresetLabel,
  resolveBookingTipCents,
  type AppointmentTagId,
  createCheckoutIdempotencyKey,
  defaultBookingDateIso,
  toggleAppointmentTag,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { NativeButton, roadTrip, theme } from '@template/mobile-ui';
import { NativeScreenHeader } from '../mystic/NativeScreenHeader';
import { NativeStylistChip } from '../mystic/NativeStylistChip';
import { NativeAddressMapPreview } from '../maps/NativeAddressMapPreview';
import { NativeAddressLookup, type HouseCallAddress } from './NativeAddressLookup';
import { NativeBookDateStrip } from './NativeBookDateStrip';
import { NativeEmptyState } from '../mystic/NativeEmptyState';
import { NativeBookEntitlementPicker } from './NativeBookEntitlementPicker';
import { NativeBookServiceCard } from './NativeBookServiceCard';
import { NativeBookStepBreadcrumb } from './NativeBookStepBreadcrumb';
import { NativeBookStepProgress } from './NativeBookStepProgress';
import { NativeBookTripSummary } from './NativeBookTripSummary';
import { NativeBookStepActions, NATIVE_BOOK_STICKY_ACTIONS_HEIGHT } from './NativeBookStepActions';
import { NativeBookingCopilot, type NativeBookingCopilotExtras } from './NativeBookingCopilot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  askBookingConcierge,
  fetchAvailability,
  fetchBookingSettings,
  fetchGeocodedDistance,
  fetchMyCredits,
  isMysticApiConfigured,
  releaseBookingCheckout,
  startBookingCheckout,
  uploadInspoPhoto,
} from '../../lib/mysticApi';
import { openStripeCheckoutSession } from '../../lib/openStripeCheckout';
import { NativePayWithStripeLabel } from '../mystic/NativeStripeWordmark';
import { useReferralAttribution } from '../../hooks/useReferralAttribution';
import { useValidatedReferralCode } from '../../hooks/useValidatedReferralCode';
import { clearReferralAttribution } from '../../lib/referral-storage';

export function NativeBookFlow() {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = NATIVE_BOOK_STICKY_ACTIONS_HEIGHT + Math.max(insets.bottom, 12) + 16;
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ canceled?: string; ref?: string }>();
  const { referralCode } = useReferralAttribution(
    searchParams.ref ?? searchParams[MYSTIC_REFERRAL_QUERY_PARAM]
  );
  const { referralApplied } = useValidatedReferralCode(referralCode);
  const checkoutReferralCode = referralApplied ? referralCode : null;
  const [step, setStep] = useState<BookingFlowStep>('service');
  const [geocodeBusy, setGeocodeBusy] = useState(false);
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState(() => defaultBookingDateIso());
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [distanceMiles, setDistanceMiles] = useState('3');
  const [distanceNote, setDistanceNote] = useState<string | null>(null);
  const [tipPreset, setTipPreset] = useState<'none' | 'cash' | 18 | 20 | 25 | 'custom'>('none');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [customTipDollars, setCustomTipDollars] = useState('');
  const [tags, setTags] = useState<AppointmentTagId[]>([]);
  const [referredBy, setReferredBy] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [surchargeRules, setSurchargeRules] = useState<SurchargeRules | null>(null);
  const [depositCents, setDepositCents] = useState(2500);
  const [inspoUris, setInspoUris] = useState<{ uri: string; name: string; mimeType?: string }[]>(
    []
  );
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [conciergePrompt, setConciergePrompt] = useState('');
  const [conciergeBusy, setConciergeBusy] = useState(false);
  const [conciergeHint, setConciergeHint] = useState<string | null>(null);
  const [conciergeExtras, setConciergeExtras] = useState<NativeBookingCopilotExtras>(null);
  const checkoutIdempotencyKey = useRef<string | null>(null);
  const entitlementTouched = useRef(false);
  const [myCredits, setMyCredits] = useState<MysticCreditRow[]>([]);
  const [address, setAddress] = useState<HouseCallAddress>({
    line1: '',
    city: 'Chicago',
    state: 'IL',
    postalCode: '',
    notes: '',
  });

  const handleCheckoutCanceledDeepLink = useCallback(async (url: string | null) => {
    if (!url || !url.includes('canceled=1')) return;
    checkoutIdempotencyKey.current = null;
    const released = await releaseBookingCheckout();
    if (released.ok) {
      setStep('datetime');
      setStatus('Checkout canceled — your hold was released. Pick a time and continue when ready.');
    } else {
      setStatus(
        'Checkout canceled — we could not release your hold automatically. Pull to refresh Visits or message Luke if the slot still looks taken.'
      );
    }
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => void handleCheckoutCanceledDeepLink(url));
    const sub = Linking.addEventListener(
      'url',
      ({ url }) => void handleCheckoutCanceledDeepLink(url)
    );
    return () => sub.remove();
  }, [handleCheckoutCanceledDeepLink]);

  useEffect(() => {
    if (searchParams.canceled === '1') {
      void handleCheckoutCanceledDeepLink('mystichair://book?canceled=1');
      router.replace('/(app)/(tabs)/book');
    }
  }, [searchParams.canceled, handleCheckoutCanceledDeepLink, router]);

  useEffect(() => {
    void fetchMyCredits()
      .then((data) =>
        setMyCredits(Array.isArray(data.credits) ? (data.credits as MysticCreditRow[]) : [])
      )
      .catch(() => setMyCredits([]));
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
    if (!entitlementTouched.current) {
      setEntitlement(inferredEntitlement);
    }
  }, [inferredEntitlement]);

  useEffect(() => {
    void fetchBookingSettings()
      .then((data) => {
        if (data.rules) setSurchargeRules(data.rules);
        if (typeof data.depositCents === 'number') setDepositCents(data.depositCents);
      })
      .catch(() => undefined);
  }, []);

  function onAddressSuggestion(s: AddressSuggestion) {
    const miles = distanceFromRiverNorthMiles(s.latitude, s.longitude);
    setDistanceMiles(String(miles.toFixed(1)));
    if (!isWithinHouseCallServiceArea(miles)) {
      setDistanceNote(houseCallDistanceOutOfAreaMessage(miles));
      return;
    }
    setDistanceNote(`${miles.toFixed(1)} mi from ${MYSTIC_RIVER_NORTH.label} (auto)`);
    setAddress((prev) => ({
      ...prev,
      line1: s.line1,
      city: s.city,
      state: s.state,
      postalCode: s.postalCode,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
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
      })
        .then((data) => {
          if (data.error) {
            setDistanceNote(data.error);
            return;
          }
          const miles = Number(data.distanceMiles);
          setDistanceMiles(String(miles));
          if (!isWithinHouseCallServiceArea(miles)) {
            setDistanceNote(houseCallDistanceOutOfAreaMessage(miles));
          } else {
            setDistanceNote(`${miles} mi from ${MYSTIC_RIVER_NORTH.label} (auto)`);
          }
          if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            setAddress((prev) => ({
              ...prev,
              latitude: data.latitude,
              longitude: data.longitude,
            }));
          }
        })
        .catch(() => setDistanceNote('Could not calculate distance'))
        .finally(() => setGeocodeBusy(false));
    }, 600);
    return () => clearTimeout(timer);
  }, [address.line1, address.city, address.state, address.postalCode]);

  useEffect(() => {
    void fetchAvailability(date, serviceId)
      .then((data) => {
        if (data.error) {
          setStatus(data.error);
          setSlots([]);
          setSlot('');
          return;
        }
        const list = data.slots ?? [];
        setSlots(list);
        setSlot(list[0] ?? '');
      })
      .catch(() => {
        setStatus('Could not load availability');
        setSlots([]);
      });
  }, [date, serviceId]);

  const scheduledAt = useMemo(() => {
    if (!date || !slot) return null;
    const at = scheduledAtFromBookingSlot(date, slot);
    return Number.isNaN(at.getTime()) ? null : at;
  }, [date, slot]);

  const miles = Number.parseFloat(distanceMiles) || 0;

  const quoteWithoutTip = useMemo(() => {
    if (!scheduledAt) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles: miles,
      entitlement: activeEntitlement,
      tipCents: 0,
      rules: surchargeRules ?? undefined,
    });
  }, [scheduledAt, serviceId, miles, activeEntitlement, surchargeRules]);

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

  function toggleTag(id: AppointmentTagId) {
    setTags((current) => toggleAppointmentTag(current, id));
  }

  async function pickInspo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setStatus('Photo library permission is required for inspo uploads');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: DEFAULT_SURCHARGE_RULES.maxInspoPhotos,
      quality: 0.85,
    });
    if (result.canceled) return;
    const next = result.assets
      .slice(0, DEFAULT_SURCHARGE_RULES.maxInspoPhotos)
      .map((a: ImagePicker.ImagePickerAsset, i: number) => ({
        uri: a.uri,
        name: a.fileName ?? `inspo-${i + 1}.jpg`,
        mimeType: a.mimeType ?? 'image/jpeg',
      }));
    setInspoUris(next);
    setStatus(null);
  }

  async function checkout() {
    if (!scheduledAt || !quote || !address.line1 || !address.postalCode) {
      setStatus('Complete address, time, and policies');
      return;
    }
    if (!isWithinHouseCallServiceArea(miles)) {
      setStatus(houseCallDistanceOutOfAreaMessage(miles));
      return;
    }
    if (!policiesAccepted) {
      setStatus('Accept house-call policies to continue');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      if (!checkoutIdempotencyKey.current) {
        checkoutIdempotencyKey.current = createCheckoutIdempotencyKey();
      }
      const result = await startBookingCheckout({
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
        distanceMiles: miles,
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
        idempotencyKey: checkoutIdempotencyKey.current,
        useMobileCancelDeepLink: true,
      });
      if (result.status === 401) {
        const ref = checkoutReferralCode ?? referralCode;
        router.push(
          ref
            ? (`/(auth)/login?ref=${encodeURIComponent(ref)}` as '/(auth)/login')
            : '/(auth)/login'
        );
        return;
      }
      if (!result.ok) {
        setStatus(
          result.status === 409
            ? (result.error ?? 'Checkout already in progress')
            : (result.error ?? 'Booking failed')
        );
        return;
      }
      checkoutIdempotencyKey.current = null;
      const appointmentId = result.appointmentId as string | undefined;
      if (appointmentId && inspoUris.length > 0) {
        const failures: string[] = [];
        for (const photo of inspoUris) {
          const up = await uploadInspoPhoto(appointmentId, photo.uri, photo.name, photo.mimeType);
          if (!up.ok) failures.push(up.error ?? 'Inspo upload failed');
        }
        if (failures.length) {
          setStatus(failures[0] ?? 'Some inspo photos did not upload');
        }
      }
      if (result.url) {
        const directSuccess =
          result.url.includes('/book/success') || result.url.includes('book/success');
        if (directSuccess) {
          void clearReferralAttribution();
          router.replace({
            pathname: '/book/success',
            params: { appointment_id: appointmentId ?? '' },
          });
          return;
        }
        const session = await openStripeCheckoutSession(result.url, 'mystichair://book/success');
        if (session.ok) {
          void clearReferralAttribution();
          router.replace({
            pathname: '/book/success',
            params: { appointment_id: appointmentId ?? '' },
          });
        } else if (session.reason === 'cancel') {
          void handleCheckoutCanceledDeepLink('mystichair://book?canceled=1');
        }
      }
    } catch {
      setStatus(
        isMysticApiConfigured()
          ? 'Network error — check your connection and tap Pay again.'
          : 'Set EXPO_PUBLIC_APP_URL to your Mystic web app, then sign in and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    const idx = BOOKING_FLOW_STEPS.indexOf(step);
    if (idx > 0) setStep(BOOKING_FLOW_STEPS[idx - 1]!);
    else router.back();
  }

  function goNext() {
    const idx = BOOKING_FLOW_STEPS.indexOf(step);
    if (idx < BOOKING_FLOW_STEPS.length - 1) setStep(BOOKING_FLOW_STEPS[idx + 1]!);
  }

  const canContinueDatetime = Boolean(date && slot);
  const distanceVerified = !geocodeBusy && Boolean(distanceNote?.includes('(auto)'));
  const distanceOutOfArea = distanceVerified && !isWithinHouseCallServiceArea(miles);
  const addressNotFound = Boolean(distanceNote?.toLowerCase().includes('not found'));
  const canContinueLocation = Boolean(
    address.line1.trim() &&
    address.state.length === 2 &&
    address.postalCode.length >= 5 &&
    distanceVerified &&
    !distanceOutOfArea &&
    !addressNotFound
  );

  const entitlementNote = clientEntitlementSummary(activeEntitlement);
  const showPlansNudge = shouldShowBookingPlansNudge(serviceId, activeEntitlement);

  async function submitConcierge() {
    const prompt = conciergePrompt.trim();
    if (prompt.length < 4) {
      setConciergeHint('Tell us the occasion or look in a sentence.');
      return;
    }
    setConciergeBusy(true);
    setConciergeHint(null);
    setConciergeExtras(null);
    try {
      const data = await askBookingConcierge(prompt);
      if (data.error) {
        setConciergeHint(data.error);
        return;
      }
      if (data.serviceId) setServiceId(data.serviceId);
      if (data.suggestedTags?.length) {
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
      });
    } catch {
      setConciergeHint('Could not recommend — pick a service below');
    } finally {
      setConciergeBusy(false);
    }
  }

  function renderStickyStepActions() {
    if (step === 'service') {
      return <NativeBookStepActions onBack={goBack} onContinue={goNext} />;
    }
    if (step === 'datetime') {
      return (
        <NativeBookStepActions
          onBack={goBack}
          onContinue={goNext}
          continueDisabled={!canContinueDatetime}
          footer={!canContinueDatetime ? 'Choose a date and time to continue.' : undefined}
        />
      );
    }
    if (step === 'location') {
      const footer = geocodeBusy
        ? 'Checking your address…'
        : distanceOutOfArea
          ? 'This address is outside our house-call zone.'
          : addressNotFound
            ? 'We could not verify that address — check street and ZIP.'
            : undefined;
      return (
        <NativeBookStepActions
          onBack={goBack}
          onContinue={goNext}
          continueDisabled={!canContinueLocation || geocodeBusy}
          footer={footer}
        />
      );
    }
    if (step === 'details') {
      return <NativeBookStepActions onBack={goBack} onContinue={goNext} continueLabel="Review" />;
    }
    if (step === 'review' && quote && scheduledAt) {
      const confirmNoPay =
        activeEntitlement !== 'none' &&
        serviceId === 'blowout' &&
        tipCents === 0 &&
        tipPreset !== 'custom';
      return (
        <NativeBookStepActions
          onBack={goBack}
          onContinue={() => void checkout()}
          continueLabel={confirmNoPay ? 'Confirm booking' : 'Pay with Stripe'}
          continueContent={
            confirmNoPay ? undefined : (
              <NativePayWithStripeLabel
                logoHeight={14}
                textStyle={{
                  fontSize: 15,
                  fontWeight: '600',
                  letterSpacing: -0.2,
                  color: theme.paper,
                }}
              />
            )
          }
          continueDisabled={!policiesAccepted || distanceOutOfArea}
          continueLoading={submitting}
        />
      );
    }
    return null;
  }

  function renderPlansNudge(compact?: boolean) {
    if (!showPlansNudge) return null;
    return (
      <View style={[styles.plansNudge, compact && styles.plansNudgeCompact]}>
        <Text style={styles.plansNudgeTitle}>{BOOKING_PLANS_NUDGE.title}</Text>
        <Text style={styles.muted}>
          {compact
            ? 'Members and package holders skip travel and evening fees on blowouts.'
            : BOOKING_PLANS_NUDGE.body}
        </Text>
        <NativeButton
          title={BOOKING_PLANS_NUDGE.cta}
          variant="outline"
          onPress={() => router.push('/(app)/(tabs)/membership')}
          style={styles.plansNudgeBtn}
        />
        {!compact ? (
          <Text style={styles.plansNudgeHint}>
            You can keep booking — fees apply to this visit.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 92 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingBottom: scrollBottomPad }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <NativeScreenHeader kicker="Book" title="House call" />
        <NativeStylistChip size={36} style={{ marginBottom: 12 }} />
        {!isMysticApiConfigured() ? (
          <Text style={styles.configBanner} accessibilityRole="alert">
            Set EXPO_PUBLIC_APP_URL to your Mystic web app (simulator: http://localhost:3000;
            device: your Mac's LAN IP). Run pnpm dev:web before booking.
          </Text>
        ) : null}
        <NativeBookStepBreadcrumb step={step} onStepChange={setStep} />
        <NativeBookStepProgress step={step} onStepChange={setStep} />

        <NativeBookTripSummary
          step={step}
          serviceId={serviceId}
          scheduledAt={scheduledAt}
          addressLine1={address.line1}
          estimateCents={quoteWithoutTip ? tipSubtotalCents : null}
        />

        {step === 'service' && (
          <>
            <View
              style={styles.serviceGrid}
              accessibilityRole="list"
              accessibilityLabel="Choose a service"
            >
              {MYSTIC_SERVICES.map((service) => (
                <NativeBookServiceCard
                  key={service.id}
                  service={service}
                  selected={serviceId === service.id}
                  onSelect={() => setServiceId(service.id)}
                />
              ))}
            </View>
            <Text style={styles.serviceHint}>
              Tap a service to select. Open Details for the full menu write-up — same info as
              flipping a card on web.
            </Text>
          </>
        )}

        {step === 'datetime' && (
          <>
            <Text style={styles.sectionLabel}>Date</Text>
            <NativeBookDateStrip value={date} onChange={setDate} />
            <Text style={styles.sectionLabel}>Time</Text>
            <View style={styles.slotRow}>
              {slots.length === 0 ? (
                <NativeEmptyState
                  variant="book-slots"
                  compact
                  action={
                    <NativeButton
                      title="Try tomorrow"
                      variant="outline"
                      onPress={() => {
                        const d = new Date(`${date}T12:00:00`);
                        d.setDate(d.getDate() + 1);
                        setDate(d.toISOString().slice(0, 10));
                      }}
                    />
                  }
                />
              ) : (
                slots.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => setSlot(time)}
                    style={[styles.slot, slot === time && styles.slotActive]}
                  >
                    <Text style={[styles.slotText, slot === time && styles.slotTextActive]}>
                      {formatBookingSlotLabel(time)}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
            <NativeBookEntitlementPicker
              value={activeEntitlement}
              options={entitlementOptions}
              onChange={(value) => {
                entitlementTouched.current = true;
                setEntitlement(value);
              }}
            />
            {entitlementNote ? (
              <Text style={styles.entitlementNote}>{entitlementNote}</Text>
            ) : showPlansNudge ? (
              renderPlansNudge()
            ) : serviceId !== 'blowout' ? (
              <Text style={styles.muted}>
                Membership and package credits apply to blowouts only.
              </Text>
            ) : (
              <Text style={styles.muted}>
                Evening and travel fees may apply when you book outside a plan.
              </Text>
            )}
          </>
        )}

        {step === 'location' && (
          <>
            <NativeAddressLookup
              address={address}
              onChange={setAddress}
              onSuggestionSelected={onAddressSuggestion}
            />
            <Text style={styles.sectionLabel}>Travel distance</Text>
            <Text style={[styles.muted, distanceOutOfArea && styles.dangerText]}>
              {geocodeBusy
                ? 'Calculating distance from your address…'
                : distanceOutOfArea
                  ? houseCallDistanceOutOfAreaMessage(miles)
                  : (distanceNote ??
                    `Enter street + ZIP to calculate from ${MYSTIC_RIVER_NORTH.label}.`)}
            </Text>
            {address.latitude != null && address.longitude != null ? (
              <NativeAddressMapPreview coords={{ lat: address.latitude, lng: address.longitude }} />
            ) : null}
            <TextInput
              placeholder="Gate code, parking, pets…"
              value={address.notes}
              onChangeText={(notes) => setAddress({ ...address, notes })}
              style={[styles.input, styles.notes]}
              multiline
              returnKeyType="done"
              blurOnSubmit
            />
          </>
        )}

        {step === 'details' && (
          <>
            <Text style={styles.sectionLabel}>{BOOK_FLOW_COPY.preferencesSection}</Text>
            {referralApplied && referralCode ? (
              <View style={styles.referralApplied}>
                <Text style={styles.referralAppliedTitle}>
                  {MYSTIC_REFERRAL_SHARE.appliedBadge}
                </Text>
                <Text style={styles.muted}>
                  Code {referralCode} — {MYSTIC_REFERRAL_SHARE.appliedHint}
                </Text>
              </View>
            ) : null}
            <View style={styles.slotRow}>
              {APPOINTMENT_TAGS.map((tag) => (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tags.includes(tag.id) }}
                  style={[styles.slot, tags.includes(tag.id) && styles.slotActive]}
                >
                  <Text style={[styles.slotText, tags.includes(tag.id) && styles.slotTextActive]}>
                    {tag.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!referralApplied ? (
              <TextInput
                placeholder={BOOK_FLOW_COPY.referredByPlaceholder}
                value={referredBy}
                onChangeText={setReferredBy}
                style={styles.input}
                returnKeyType="done"
              />
            ) : null}
            <NativeButton
              title={BOOK_FLOW_COPY.addInspoPhotos}
              variant="secondary"
              onPress={pickInspo}
            />
            {inspoUris.length > 0 ? (
              <>
                <Text style={styles.muted}>{inspoUris.length} photo(s) selected</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.inspoRow}
                >
                  {inspoUris.map((photo) => (
                    <Image
                      key={photo.uri}
                      source={{ uri: photo.uri }}
                      style={styles.inspoThumb}
                      accessibilityLabel="Inspo photo preview"
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        )}

        {step === 'review' && quote && scheduledAt && (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>
                {MYSTIC_SERVICES.find((s) => s.id === serviceId)?.name}
              </Text>
              <Text style={styles.muted}>{formatVisitWhen(scheduledAt.toISOString())}</Text>
              <Text style={styles.muted}>
                {address.line1}, {address.city}
              </Text>
              {activeEntitlement !== 'none' && serviceId === 'blowout' ? (
                <Text style={styles.entitlementNote}>
                  {clientEntitlementSummary(activeEntitlement)}
                </Text>
              ) : null}
              {quote.surcharges.map((line) => (
                <Text key={line.code} style={styles.muted}>
                  {line.label}: {formatUsd(line.amountCents)}
                </Text>
              ))}
              <Text style={styles.muted}>
                Refundable booking deposit: {formatUsd(depositCents)}
              </Text>
              <Text style={styles.summaryTotal}>
                {formatUsd(
                  activeEntitlement !== 'none' && serviceId === 'blowout'
                    ? tipCents
                    : quote.totalCents
                )}
              </Text>
              {activeEntitlement !== 'none' && serviceId === 'blowout' && tipCents === 0 ? (
                <Text style={styles.muted}>Service covered by your plan — tip optional below.</Text>
              ) : null}
            </View>
            {quote.surcharges.length > 0 ? renderPlansNudge(true) : null}
            <Text style={styles.sectionLabel}>Tip</Text>
            <Text style={styles.muted}>
              Percent of service + surcharges, custom amount, or cash.
            </Text>
            <View style={styles.slotRow}>
              {([18, 20, 25] as const).map((percent) => (
                <Pressable
                  key={percent}
                  onPress={() => {
                    setTipPreset(percent);
                    setCustomTipPercent('');
                    setCustomTipDollars('');
                  }}
                  style={[styles.slot, tipPreset === percent && styles.slotActive]}
                >
                  <Text style={[styles.slotText, tipPreset === percent && styles.slotTextActive]}>
                    {formatTipPresetLabel(percent, tipSubtotalCents)}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setTipPreset('custom')}
                style={[styles.slot, tipPreset === 'custom' && styles.slotActive]}
              >
                <Text style={[styles.slotText, tipPreset === 'custom' && styles.slotTextActive]}>
                  Custom
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTipPreset('cash');
                  setCustomTipPercent('');
                  setCustomTipDollars('');
                }}
                style={[styles.slot, tipPreset === 'cash' && styles.slotActive]}
              >
                <Text style={[styles.slotText, tipPreset === 'cash' && styles.slotTextActive]}>
                  {BOOK_FLOW_COPY.tipInCash}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTipPreset('none');
                  setCustomTipPercent('');
                  setCustomTipDollars('');
                }}
                style={[styles.slot, tipPreset === 'none' && styles.slotActive]}
              >
                <Text style={[styles.slotText, tipPreset === 'none' && styles.slotTextActive]}>
                  No tip
                </Text>
              </Pressable>
            </View>
            {tipPreset === 'custom' ? (
              <>
                <TextInput
                  placeholder="Custom % (e.g. 22)"
                  value={customTipPercent}
                  onChangeText={(v) => {
                    setCustomTipDollars('');
                    setCustomTipPercent(v);
                  }}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Or custom amount (e.g. 15.00)"
                  value={customTipDollars}
                  onChangeText={(v) => {
                    setCustomTipPercent('');
                    setCustomTipDollars(v);
                  }}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </>
            ) : null}
            {tipPreset === 'cash' ? (
              <Text style={styles.muted}>{BOOK_FLOW_COPY.tipCashNote}</Text>
            ) : tipCents > 0 ? (
              <Text style={styles.muted}>Tip total: {formatUsd(tipCents)}</Text>
            ) : null}
            {HOUSE_CALL_POLICIES.map((policy) => (
              <View key={policy.id} style={styles.policy}>
                <Text style={styles.policyTitle}>{policy.title}</Text>
                <Text style={styles.muted}>{policy.body}</Text>
              </View>
            ))}
            <View style={styles.policyRow}>
              <Switch value={policiesAccepted} onValueChange={setPoliciesAccepted} />
              <Text style={styles.policyAccept}>
                I agree to house-call policies and SMS updates.
              </Text>
            </View>
          </>
        )}

        {status ? (
          <Text style={styles.muted} accessibilityRole="alert">
            {status}
          </Text>
        ) : null}
      </ScrollView>
      {renderStickyStepActions()}
      <NativeBookingCopilot
        prompt={conciergePrompt}
        onPromptChange={setConciergePrompt}
        busy={conciergeBusy}
        hint={conciergeHint}
        extras={conciergeExtras}
        onSubmit={() => void submitConcierge()}
        onPickService={setServiceId}
        fabBottomOffset={scrollBottomPad - 8}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1, backgroundColor: theme.paper },
  scroll: { flex: 1, backgroundColor: theme.paper },
  entitlementNote: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.plum,
    backgroundColor: theme.chalkSoft,
    padding: 12,
    borderRadius: theme.radii.md,
    marginBottom: 8,
  },
  referralApplied: {
    marginBottom: 12,
    padding: 12,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.plum,
    backgroundColor: theme.goldSoft,
    gap: 4,
  },
  referralAppliedTitle: { fontSize: 14, fontWeight: '600', color: theme.ink },
  plansNudge: {
    marginBottom: 12,
    padding: 14,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    gap: 8,
  },
  plansNudgeCompact: {
    marginTop: 4,
    marginBottom: 16,
  },
  plansNudgeTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  plansNudgeBtn: { alignSelf: 'flex-start', marginTop: 4 },
  plansNudgeHint: { fontSize: 12, color: theme.muted, lineHeight: 16 },
  container: { padding: 20 },
  configBanner: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.chalkSoft,
    color: theme.plum,
    fontSize: 13,
    lineHeight: 18,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  inspoRow: { marginTop: 8, marginBottom: 4 },
  inspoThumb: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.md,
    marginRight: 8,
    backgroundColor: theme.line,
  },
  serviceHint: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  sectionLabel: { ...roadTrip.kicker, color: theme.muted, marginTop: 16, marginBottom: 10 },
  input: {
    ...roadTrip.flatInput,
    marginBottom: 14,
  },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  slot: roadTrip.chip,
  slotActive: roadTrip.chipActive,
  slotText: roadTrip.chipText,
  slotTextActive: roadTrip.chipTextActive,
  summary: {
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.gold,
    backgroundColor: theme.goldSoft,
  },
  summaryTitle: { fontWeight: '600', fontSize: 17 },
  summaryTotal: { fontSize: 26, fontWeight: '600', marginTop: 8 },
  policy: { marginTop: 12 },
  policyTitle: { fontWeight: '600', color: theme.ink },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  policyAccept: { flex: 1, fontSize: 13, color: theme.ink },
  muted: { color: theme.muted, fontSize: 13, marginTop: 6 },
  dangerText: { color: theme.danger, marginTop: 6 },
  cta: { marginTop: 10 },
});
