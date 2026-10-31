import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
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
  type AddressSuggestion,
  formatUsd,
  formatVisitWhen,
  type AppointmentTagId,
  createCheckoutIdempotencyKey,
  toggleAppointmentTag,
  type BookingFlowStep,
  type ServiceId,
  type SurchargeRules,
} from '@template/mystic';
import { NativeButton, roadTrip, theme } from '@template/mobile-ui';
import { NativeServiceIllustration } from '../mystic/NativeServiceIllustration';
import { NativeScreenHeader } from '../mystic/NativeScreenHeader';
import { NativeAddressMapPreview } from '../maps/NativeAddressMapPreview';
import { NativeAddressLookup, type HouseCallAddress } from './NativeAddressLookup';
import { NativeBookDateStrip } from './NativeBookDateStrip';
import { NativeEmptyState } from '../mystic/NativeEmptyState';
import { NativeBookStepProgress } from './NativeBookStepProgress';
import {
  fetchAvailability,
  fetchBookingSettings,
  fetchGeocodedDistance,
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
  const [tipCents, setTipCents] = useState(0);
  const [tags, setTags] = useState<AppointmentTagId[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [surchargeRules, setSurchargeRules] = useState<SurchargeRules | null>(null);
  const [depositCents, setDepositCents] = useState(2500);
  const [inspoUris, setInspoUris] = useState<{ uri: string; name: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const checkoutIdempotencyKey = useRef<string | null>(null);
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
    setDistanceNote(`${miles.toFixed(1)} mi from ${MYSTIC_RIVER_NORTH.label}`);
    setAddress((prev) => ({
      ...prev,
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
          setDistanceMiles(String(data.distanceMiles));
          setDistanceNote(`${data.distanceMiles} mi from ${MYSTIC_RIVER_NORTH.label}`);
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
    return new Date(`${date}T${slot.length === 5 ? slot : slot.slice(0, 5)}:00`);
  }, [date, slot]);

  const miles = Number.parseFloat(distanceMiles) || 0;

  const quote = useMemo(() => {
    if (!scheduledAt) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles: miles,
      entitlement,
      tipCents,
      rules: surchargeRules ?? undefined,
    });
  }, [scheduledAt, serviceId, miles, entitlement, tipCents, surchargeRules]);

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
      setStatus('Set EXPO_PUBLIC_APP_URL and sign in');
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
  const canContinueLocation = Boolean(
    address.line1.trim() &&
    address.state.length === 2 &&
    address.postalCode.length >= 5 &&
    !geocodeBusy &&
    distanceNote &&
    !distanceNote.toLowerCase().includes('not found')
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <NativeScreenHeader
        kicker="Book"
        title="House call"
        lede="Chicago mobile styling — Luke rolls up with the full kit."
      />
      {!isMysticApiConfigured() ? (
        <Text style={styles.configBanner} accessibilityRole="alert">
          Set EXPO_PUBLIC_APP_URL to your Mystic web app (simulator: http://localhost:3000; device:
          your Mac's LAN IP). Run pnpm dev:web before booking.
        </Text>
      ) : null}
      <NativeBookStepProgress step={step} onStepChange={setStep} />

      {step === 'service' && (
        <>
          {MYSTIC_SERVICES.map((service) => {
            const selected = serviceId === service.id;
            return (
              <Pressable
                key={service.id}
                onPress={() => setServiceId(service.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${service.name}, ${service.durationMinutes} minutes, ${formatUsd(service.priceCents)}`}
                style={[styles.serviceRow, selected && styles.serviceRowSelected]}
              >
                <View style={styles.serviceRowInner}>
                  <NativeServiceIllustration serviceId={service.id} />
                  <View style={styles.serviceCopy}>
                    <Text style={styles.cardTitle}>{service.name}</Text>
                    <Text style={styles.cardMeta}>
                      {service.durationMinutes} min · {formatUsd(service.priceCents)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
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
                    {time}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
          <Text style={styles.sectionLabel}>Plan</Text>
          <View style={styles.slotRow}>
            {(['none', 'membership', 'package'] as const).map((plan) => (
              <Pressable
                key={plan}
                onPress={() => setEntitlement(plan)}
                style={[styles.slot, entitlement === plan && styles.slotActive]}
              >
                <Text style={[styles.slotText, entitlement === plan && styles.slotTextActive]}>
                  {plan}
                </Text>
              </Pressable>
            ))}
          </View>
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
          <Text style={styles.muted}>
            {geocodeBusy
              ? 'Calculating distance from your address…'
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
          />
          <TextInput
            placeholder="Referred by (name)"
            value={referredBy}
            onChangeText={setReferredBy}
            style={styles.input}
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
            <Text style={styles.muted}>Deposit hold: {formatUsd(depositCents)}</Text>
            <Text style={styles.summaryTotal}>{formatUsd(quote.totalCents)}</Text>
          </View>
          <Text style={styles.sectionLabel}>Tip</Text>
          <View style={styles.slotRow}>
            {[0, 1000, 1500, 2000].map((cents) => (
              <Pressable
                key={cents}
                onPress={() => setTipCents(cents)}
                style={[styles.slot, tipCents === cents && styles.slotActive]}
              >
                <Text style={[styles.slotText, tipCents === cents && styles.slotTextActive]}>
                  {cents === 0 ? 'None' : formatUsd(cents)}
                </Text>
              </Pressable>
            ))}
          </View>
          {HOUSE_CALL_POLICIES.map((policy) => (
            <View key={policy.id} style={styles.policy}>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.muted}>{policy.body}</Text>
            </View>
          ))}
          <View style={styles.policyRow}>
            <Switch value={policiesAccepted} onValueChange={setPoliciesAccepted} />
            <Text style={styles.policyAccept}>I agree to house-call policies and SMS updates.</Text>
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
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 48 },
  configBanner: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.plum,
    backgroundColor: theme.chalkSoft,
    color: theme.plum,
    fontSize: 13,
    lineHeight: 18,
  },
  serviceRow: {
    ...roadTrip.flatRow,
    paddingVertical: 16,
  },
  serviceRowSelected: roadTrip.flatRowSelected,
  serviceRowInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serviceCopy: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.ink },
  cardMeta: { marginTop: 4, color: theme.muted, fontSize: 13 },
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
  cta: { marginTop: 10 },
  rowButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  half: { flex: 1 },
});
