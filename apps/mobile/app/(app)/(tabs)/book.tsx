import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MYSTIC_SERVICES, computeBookingQuote, formatUsd, type ServiceId } from '@template/mystic';
import { NativeButton, displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { NativeBookDateStrip } from '../../../components/book/NativeBookDateStrip';
import { fetchAvailability, startBookingCheckout } from '../../../lib/mysticApi';

function tomorrowIsoDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookTab() {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<ServiceId>('blowout');
  const [date, setDate] = useState(tomorrowIsoDate());
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [entitlement, setEntitlement] = useState<'none' | 'membership' | 'package'>('none');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({
    line1: '',
    city: 'Chicago',
    state: 'IL',
    postalCode: '',
  });

  useEffect(() => {
    void fetchAvailability(date, serviceId)
      .then((data) => {
        const list = data.slots ?? [];
        setSlots(list);
        setSlot(list[0] ?? '');
      })
      .catch(() => setSlots([]));
  }, [date, serviceId]);

  const scheduledAt = useMemo(() => {
    if (!date || !slot) return null;
    return new Date(`${date}T${slot.length === 5 ? slot : slot.slice(0, 5)}:00`);
  }, [date, slot]);

  const quote = useMemo(() => {
    if (!scheduledAt) return null;
    return computeBookingQuote({
      serviceId,
      scheduledAt,
      distanceMiles: 4,
      entitlement,
    });
  }, [scheduledAt, serviceId, entitlement]);

  const quoteCents =
    entitlement !== 'none' && serviceId === 'blowout' ? 0 : (quote?.totalCents ?? 0);

  async function checkout() {
    if (!scheduledAt || !quote || !address.line1) {
      setStatus('Add address and pick a time');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const result = await startBookingCheckout({
        serviceId,
        scheduledAt: scheduledAt.toISOString(),
        address: { ...address, notes: undefined },
        distanceMiles: 4,
        entitlement,
        quoteCents,
        surchargeJson: quote.surcharges,
        tags: [],
        policiesAccepted: true,
      });
      if (result.status === 401) {
        router.push('/(auth)/login');
        return;
      }
      if (!result.ok) {
        setStatus(result.error ?? 'Booking failed');
        return;
      }
      if (result.url) await Linking.openURL(result.url);
    } catch {
      setStatus('Set EXPO_PUBLIC_APP_URL and sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Book</Text>
      <Text style={styles.heading}>House call</Text>

      {MYSTIC_SERVICES.map((service) => {
        const selected = serviceId === service.id;
        return (
          <Pressable
            key={service.id}
            onPress={() => setServiceId(service.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${service.name}, ${service.durationMinutes} minutes, ${formatUsd(service.priceCents)}`}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <Text style={styles.cardTitle}>{service.name}</Text>
            <Text style={styles.cardMeta}>
              {service.durationMinutes} min · {formatUsd(service.priceCents)}
            </Text>
          </Pressable>
        );
      })}

      <Text style={styles.sectionLabel}>Date</Text>
      <NativeBookDateStrip value={date} onChange={setDate} />

      <Text style={styles.sectionLabel}>Time</Text>
      <View style={styles.slotRow}>
        {slots.length === 0 ? (
          <Text style={styles.muted}>No slots — try another day</Text>
        ) : (
          slots.map((time) => (
            <Pressable
              key={time}
              onPress={() => setSlot(time)}
              accessibilityRole="button"
              accessibilityState={{ selected: slot === time }}
              accessibilityLabel={`Time ${time}`}
              style={[styles.slot, slot === time && styles.slotActive]}
            >
              <Text style={[styles.slotText, slot === time && styles.slotTextActive]}>{time}</Text>
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
            accessibilityRole="button"
            accessibilityState={{ selected: entitlement === plan }}
            accessibilityLabel={`Booking type ${plan}`}
            style={[styles.slot, entitlement === plan && styles.slotActive]}
          >
            <Text style={[styles.slotText, entitlement === plan && styles.slotTextActive]}>
              {plan}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder="Street address"
        accessibilityLabel="Street address"
        value={address.line1}
        onChangeText={(line1) => setAddress({ ...address, line1 })}
        style={styles.input}
      />

      {quote ? (
        <View style={styles.summary}>
          <Text style={styles.summaryTotal}>{formatUsd(quoteCents)}</Text>
          {entitlement !== 'none' && serviceId === 'blowout' ? (
            <Text style={styles.muted}>Using blowout credit + any tip at checkout</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.secure}>Secure booking · encrypted checkout via Stripe</Text>
      <NativeButton
        title="Continue to checkout"
        onPress={checkout}
        isLoading={submitting}
        style={styles.cta}
      />
      {status ? (
        <Text style={styles.muted} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {status}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  kicker: { ...monoLabel, color: theme.accent, marginBottom: 8 },
  heading: { ...displayTitle, color: theme.ink, marginBottom: 16 },
  card: {
    backgroundColor: theme.surface,
    padding: 18,
    marginBottom: 12,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: '#1F1E1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    shadowOpacity: 0.1,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.ink },
  cardMeta: { marginTop: 4, color: theme.muted, fontSize: 13 },
  sectionLabel: { ...monoLabel, color: theme.muted, marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 14,
    marginBottom: 10,
    color: theme.ink,
    backgroundColor: theme.surface,
    fontSize: 16,
  },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  slot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.line,
  },
  slotActive: { backgroundColor: theme.shell, borderColor: theme.shell },
  slotText: { color: theme.ink, fontSize: 12 },
  slotTextActive: { color: theme.paper },
  summary: {
    marginTop: 16,
    padding: 18,
    backgroundColor: theme.goldSoft,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(196, 169, 98, 0.25)',
  },
  summaryTotal: { fontSize: 26, fontWeight: '600', letterSpacing: -0.5, color: theme.ink },
  muted: { color: theme.muted, fontSize: 13, marginTop: 8 },
  secure: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: theme.muted,
  },
  cta: { marginTop: 10 },
});
