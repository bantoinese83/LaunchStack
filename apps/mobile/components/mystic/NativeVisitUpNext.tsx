import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  formatAddressLine,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  visitAddressDestination,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, theme } from '@template/mobile-ui';
import { nativeScreenStyles } from './nativeScreenStyles';
import { NativeDoorTimerBanner } from '../visits/NativeDoorTimerBanner';
import { NativeLiveMap } from '../visits/NativeLiveMap';
import { NativeServiceIllustration } from './NativeServiceIllustration';
import { NativeStylistChip } from './NativeStylistChip';

type Visit = {
  id: string;
  service_id: string;
  starts_at: string;
  status: string;
  address?: Record<string, unknown>;
  eta_minutes: number | null;
  door_timer_ends_at: string | null;
  stylist_latitude: number | null;
  stylist_longitude: number | null;
  stylist_location_updated_at: string | null;
};

export function NativeVisitUpNext({ visit }: { visit: Visit }) {
  const router = useRouter();
  let serviceName = visit.service_id;
  try {
    serviceName = getServiceById(visit.service_id as ServiceId).name;
  } catch {
    /* keep id */
  }
  const live = isVisitLiveTracking(visit.status);
  const addressLine = formatAddressLine(visit.address);

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>Up next</Text>
      <View
        style={[
          nativeScreenStyles.card,
          Platform.OS === 'android' && nativeScreenStyles.cardAndroid,
          live && styles.liveRing,
        ]}
      >
        <Text style={styles.when}>{formatVisitWhen(visit.starts_at)}</Text>
        <View style={styles.serviceRow}>
          <NativeServiceIllustration serviceId={visit.service_id as ServiceId} size={48} />
          <Text style={styles.service}>{serviceName}</Text>
        </View>
        <NativeStylistChip style={{ marginTop: 10 }} />
        {addressLine ? <Text style={styles.address}>{addressLine}</Text> : null}
        {visit.status === 'stylist_en_route' && visit.eta_minutes ? (
          <Text style={styles.eta}>Luke is ~{visit.eta_minutes} min away</Text>
        ) : null}
        {visit.status === 'door_timer_active' && visit.door_timer_ends_at ? (
          <NativeDoorTimerBanner endsAt={visit.door_timer_ends_at} />
        ) : null}
        {visit.status === 'stylist_en_route' &&
        visit.stylist_latitude != null &&
        visit.stylist_longitude != null ? (
          <NativeLiveMap
            latitude={visit.stylist_latitude}
            longitude={visit.stylist_longitude}
            updatedAt={visit.stylist_location_updated_at}
            destination={visitAddressDestination(visit.address)}
          />
        ) : null}
        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/(app)/(tabs)/messages')}>
            <Text style={styles.link}>Message Luke</Text>
          </Pressable>
          <NativeButton
            title="Book another"
            variant="secondary"
            onPress={() => router.push('/(app)/(tabs)/book')}
            style={styles.bookBtn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.plum,
    marginBottom: 8,
  },
  liveRing: {
    borderLeftWidth: 3,
    borderLeftColor: theme.gold,
    paddingLeft: 4,
    backgroundColor: theme.goldSoft,
  },
  when: { fontWeight: '600', fontSize: 17, color: theme.ink },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  service: { flex: 1, color: theme.ink, fontWeight: '500' },
  address: { marginTop: 6, fontSize: 12, color: theme.muted },
  eta: { marginTop: 8, fontSize: 13, color: theme.chalk },
  actions: { marginTop: 14, gap: 10 },
  link: { color: theme.accent, fontWeight: '600', fontSize: 14 },
  bookBtn: { marginTop: 4 },
});
