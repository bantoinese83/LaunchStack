import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useRouter } from 'expo-router';
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
  clientEntitlementSummary,
  shouldShowBookingPlansNudge,
  BOOKING_PLANS_NUDGE,
  type MysticCreditRow,
  bookingSubtotalBeforeTip,
  buildTipChoiceFromUi,
  formatTipPresetLabel,
  resolveBookingTipCents,
  type AppointmentTagId,
  createCheckoutIdempotencyKey,
  toggleAppointmentTag,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { NativeButton, roadTrip, theme } from '@template/mobile-ui';
import { NativeAiOrb } from '../mystic/NativeAiOrb';
import { NativeServiceIllustration } from '../mystic/NativeServiceIllustration';
import { NativeScreenHeader } from '../mystic/NativeScreenHeader';
import { NativeAddressMapPreview } from '../maps/NativeAddressMapPreview';
import { NativeAddressLookup, type HouseCallAddress } from './NativeAddressLookup';
import { NativeBookDateStrip } from './NativeBookDateStrip';
import { NativeEmptyState } from '../mystic/NativeEmptyState';
import { NativeBookStepProgress } from './NativeBookStepProgress';
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

function tomorrowIsoDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function NativeBookFlow() {
  const router = useRouter();
  const [step, setStep] = useState<BookingFlowStep>('service');
  const [geocodeBusy, setGeocodeBusy] = useState(false);
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState(tomorrowIsoDate());
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [distanceMiles, setDistanceMiles] = useState('3');
  const [distanceNote, setDistanceNote] = useState<string | null>(null);
  const [tipPreset, setTipPreset] = useState<'none' | 15 | 18 | 20 | 'custom'>('none');
  const [customTipPercent, setCustomTipPercent] = useState('');
  const [customTipDollars, setCustomTipDollars] = useState('');
  const [tags, setTags] = useState<AppointmentTagId[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [surchargeRules, setSurchargeRules] = useState<SurchargeRules | null>(null);
  const [depositCents, setDepositCents] = useState(2500);
  const [inspoUris, setInspoUris] = useState<{ uri: string; name: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [conciergePrompt, setConciergePrompt] = useState('');
  const [conciergeBusy, setConciergeBusy] = useState(false);
  const [conciergeHint, setConciergeHint] = useState<string | null>(null);
  const checkoutIdempotencyKey = useRef<string | null>(null);
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
    setStatus(
      released.ok
        ? 'Checkout canceled — your hold was released. Pick a time and try again when ready.'
        : 'Checkout canceled — we could not release your hold automatically. Pull to refresh Visits or message Luke if the slot still looks taken.'
    );
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

  useEffect(() => {
    setEntitlement(inferredEntitlement);
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
      entitlement,
      tipCents: 0,
      rules: surchargeRules ?? undefined,
    });
  }, [scheduledAt, serviceId, miles, entitlement, surchargeRules]);

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
      }));
    setInspoUris(next);
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
        entitlement,
        quoteCents:
          entitlement !== 'none' && serviceId === 'blowout' ? 0 : quote.totalCents - tipCents,
        surchargeJson: quote.surcharges,
        tipCents,
        tags,
        referredByName: referredBy.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
        clientNotes: address.notes || undefined,
        policiesAccepted: true,
        idempotencyKey: checkoutIdempotencyKey.current,
        useMobileCancelDeepLink: true,
      });
      if (result.status === 401) {
        router.push('/(auth)/login');
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
          const up = await uploadInspoPhoto(appointmentId, photo.uri, photo.name);
          if (!up.ok) failures.push(up.error ?? 'Inspo upload failed');
        }
        if (failures.length) {
          setStatus(failures[0] ?? 'Some inspo photos did not upload');
        }
      }
      if (result.url) await Linking.openURL(result.url);
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
  }

  function goNext() {
    const idx = BOOKING_FLOW_STEPS.indexOf(step);
    if (idx < BOOKING_FLOW_STEPS.length - 1) setStep(BOOKING_FLOW_STEPS[idx + 1]!);
  }

  const canContinueDatetime = Boolean(date && slot);
  const distanceVerified = !geocodeBusy && Boolean(distanceNote?.includes('(auto)'));
  const distanceOutOfArea = distanceVerified && !isWithinHouseCallServiceArea(miles);
  const canContinueLocation = Boolean(
    address.line1.trim() &&
    address.state.length === 2 &&
    address.postalCode.length >= 5 &&
    distanceVerified &&
    !distanceOutOfArea
  );

  const entitlementNote = clientEntitlementSummary(entitlement);
  const showPlansNudge = shouldShowBookingPlansNudge(serviceId, entitlement);

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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <NativeScreenHeader
          kicker="Book"
          title="House call"
          lede="Chicago mobile styling — Luke rolls up with the full kit."
        />
        {!isMysticApiConfigured() ? (
          <Text style={styles.configBanner} accessibilityRole="alert">
            Set EXPO_PUBLIC_APP_URL to your Mystic web app (simulator: http://localhost:3000;
            device: your Mac's LAN IP). Run pnpm dev:web before booking.
          </Text>
        ) : null}
        <NativeBookStepProgress step={step} onStepChange={setStep} />

        {step === 'service' && (
          <>
            <View style={styles.conciergeHeader}>
              <NativeAiOrb active={conciergeBusy} size="sm" label="Booking concierge" />
              <View style={styles.conciergeCopy}>
                <Text style={styles.conciergeTitle}>Not sure? Ask the concierge</Text>
                <Text style={styles.conciergeHint}>Describe the look — I’ll match a service.</Text>
              </View>
            </View>
            <TextInput
              value={conciergePrompt}
              onChangeText={setConciergePrompt}
              placeholder="Wedding guest, soft waves…"
              multiline
              style={styles.conciergeInput}
              placeholderTextColor={theme.muted}
              returnKeyType="done"
              blurOnSubmit
            />
            <NativeButton
              title={conciergeBusy ? 'Matching…' : 'Recommend a service'}
              variant="outline"
              isLoading={conciergeBusy}
              onPress={() => {
                void (async () => {
                  const prompt = conciergePrompt.trim();
                  if (prompt.length < 4) {
                    setConciergeHint('Tell us the occasion or look in a sentence.');
                    return;
                  }
                  setConciergeBusy(true);
                  setConciergeHint(null);
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
                    const alt =
                      data.alternatives?.[0] != null
                        ? ` Or try ${data.alternatives[0].serviceName ?? data.alternatives[0].serviceId}: ${data.alternatives[0].why}`
                        : '';
                    const ask = data.clarifyingQuestion
                      ? ` Still unsure? ${data.clarifyingQuestion}`
                      : '';
                    setConciergeHint(
                      `${data.serviceName}: ${data.reason}${data.tip ? ` — ${data.tip}` : ''}${alt}${ask}`
                    );
                  } catch {
                    setConciergeHint('Could not recommend — pick below');
                  } finally {
                    setConciergeBusy(false);
                  }
                })();
              }}
              style={styles.cta}
            />
            {conciergeHint ? <Text style={styles.cardMeta}>{conciergeHint}</Text> : null}
            <View style={styles.serviceGrid}>
              {MYSTIC_SERVICES.map((service) => {
                const selected = serviceId === service.id;
                return (
                  <Pressable
                    key={service.id}
                    onPress={() => setServiceId(service.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${service.name}, ${service.durationMinutes} minutes, ${formatUsd(service.priceCents)}`}
                    style={[styles.serviceTile, selected && styles.serviceTileSelected]}
                  >
                    <NativeServiceIllustration serviceId={service.id} />
                    <Text style={styles.cardTitle}>{service.name}</Text>
                    <Text style={styles.cardMeta}>
                      {service.durationMinutes} min · {formatUsd(service.priceCents)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <NativeButton title="Continue" onPress={goNext} style={styles.cta} />
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
            <View style={styles.rowButtons}>
              <NativeButton title="Back" variant="secondary" onPress={goBack} style={styles.half} />
              <NativeButton
                title="Continue"
                onPress={goNext}
                disabled={!canContinueDatetime}
                style={styles.half}
              />
            </View>
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
            <View style={styles.rowButtons}>
              <NativeButton title="Back" variant="secondary" onPress={goBack} style={styles.half} />
              <NativeButton
                title="Continue"
                onPress={goNext}
                disabled={!canContinueLocation}
                style={styles.half}
              />
            </View>
          </>
        )}

        {step === 'details' && (
          <>
            <View style={styles.slotRow}>
              {APPOINTMENT_TAGS.map((tag) => (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  style={[styles.slot, tags.includes(tag.id) && styles.slotActive]}
                >
                  <Text style={[styles.slotText, tags.includes(tag.id) && styles.slotTextActive]}>
                    {tag.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Referral code (optional)"
              value={referralCode}
              onChangeText={(v) => setReferralCode(v.toUpperCase())}
              style={styles.input}
              autoCapitalize="characters"
              returnKeyType="done"
            />
            <TextInput
              placeholder="Referred by (name)"
              value={referredBy}
              onChangeText={setReferredBy}
              style={styles.input}
              returnKeyType="done"
            />
            <NativeButton title="Add inspo photos" variant="secondary" onPress={pickInspo} />
            {inspoUris.length > 0 ? (
              <Text style={styles.muted}>{inspoUris.length} photo(s) selected</Text>
            ) : null}
            <View style={styles.rowButtons}>
              <NativeButton title="Back" variant="secondary" onPress={goBack} style={styles.half} />
              <NativeButton title="Review" onPress={goNext} style={styles.half} />
            </View>
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
              {quote.surcharges.map((line) => (
                <Text key={line.code} style={styles.muted}>
                  {line.label}: {formatUsd(line.amountCents)}
                </Text>
              ))}
              <Text style={styles.muted}>
                Refundable booking deposit: {formatUsd(depositCents)}
              </Text>
              <Text style={styles.summaryTotal}>{formatUsd(quote.totalCents)}</Text>
            </View>
            {quote.surcharges.length > 0 ? renderPlansNudge(true) : null}
            <Text style={styles.sectionLabel}>Tip</Text>
            <Text style={styles.muted}>Percent of service + surcharges, or enter your own.</Text>
            <View style={styles.slotRow}>
              {([15, 18, 20] as const).map((percent) => (
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
            {tipCents > 0 ? (
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
            <View style={styles.rowButtons}>
              <NativeButton title="Back" variant="secondary" onPress={goBack} style={styles.half} />
              <NativeButton
                title="Pay with Stripe"
                onPress={checkout}
                isLoading={submitting}
                disabled={!policiesAccepted}
                style={styles.half}
              />
            </View>
          </>
        )}

        {status ? (
          <Text style={styles.muted} accessibilityRole="alert">
            {status}
          </Text>
        ) : null}
      </ScrollView>
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
  container: { padding: 20, paddingBottom: 48 },
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
    marginTop: 20,
    marginBottom: 8,
  },
  serviceTile: {
    width: '47.5%',
    flexGrow: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    gap: 8,
  },
  serviceTileSelected: {
    backgroundColor: theme.goldSoft,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  cardMeta: { marginTop: 2, color: theme.muted, fontSize: 12 },
  conciergeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  conciergeCopy: { flex: 1, minWidth: 0 },
  conciergeTitle: { ...roadTrip.kicker, color: theme.muted },
  conciergeHint: { marginTop: 2, fontSize: 12, color: theme.muted },
  conciergeInput: {
    ...roadTrip.flatInput,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 8,
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
  rowButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  half: { flex: 1 },
});
