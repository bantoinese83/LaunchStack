import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  canUploadVisitInspo,
  DEFAULT_SURCHARGE_RULES,
  formatUsd,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  sortVisitsForDisplay,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { NativeInspoGallery } from '../../../components/mystic/NativeInspoGallery';
import { NativeDoorTimerBanner } from '../../../components/visits/NativeDoorTimerBanner';
import { NativeLiveMap } from '../../../components/visits/NativeLiveMap';
import { fetchMyAppointments, uploadInspoPhoto } from '../../../lib/mysticApi';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  quote_cents: number;
  eta_minutes: number | null;
  door_timer_ends_at: string | null;
  stylist_latitude: number | null;
  stylist_longitude: number | null;
  stylist_location_updated_at: string | null;
  inspo_photos?: { id: string; public_url: string }[];
};

export default function VisitsTab() {
  const router = useRouter();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadBusyId, setUploadBusyId] = useState<string | null>(null);

  const reload = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) setRefreshing(true);
    void fetchMyAppointments()
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setRows(data.appointments ?? []);
        }
      })
      .catch(() => setError('Sign in to see visits'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload({ silent: true });
    }, [reload])
  );

  const sorted = useMemo(() => sortVisitsForDisplay(rows), [rows]);
  const hasLiveTracking = useMemo(() => rows.some((r) => isVisitLiveTracking(r.status)), [rows]);

  useEffect(() => {
    if (!hasLiveTracking) return;
    const id = setInterval(() => reload({ silent: true }), 12_000);
    return () => clearInterval(id);
  }, [hasLiveTracking, reload]);

  async function addInspo(appointmentId: string) {
    setUploadStatus(null);
    setUploadBusyId(appointmentId);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setUploadStatus('Allow photo access to upload inspo');
      setUploadBusyId(null);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) {
      setUploadBusyId(null);
      return;
    }
    const asset = result.assets[0];
    const res = await uploadInspoPhoto(appointmentId, asset.uri, asset.fileName ?? 'inspo.jpg');
    setUploadBusyId(null);
    setUploadStatus(res.error ? res.error : 'Photo saved — Luke will see it before your visit.');
    reload({ silent: true });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => reload()}
          tintColor={theme.accent}
        />
      }
    >
      <Text style={styles.kicker}>Visits</Text>
      <Text style={styles.heading}>Your appointments</Text>
      {hasLiveTracking ? (
        <Text style={styles.liveHint}>Live updates while Luke is on the way</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {uploadStatus ? <Text style={styles.feedback}>{uploadStatus}</Text> : null}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : null}
      {!loading && sorted.length === 0 && !error ? (
        <NativeEmptyState
          variant="visits"
          action={
            <NativeButton
              title="Book a house call"
              onPress={() => router.push('/(app)/(tabs)/book')}
            />
          }
        />
      ) : null}
      {sorted.map((visit) => {
        let name = visit.service_id;
        try {
          name = getServiceById(visit.service_id as ServiceId).name;
        } catch {
          /* keep id */
        }
        const live = isVisitLiveTracking(visit.status);
        return (
          <View
            key={visit.id}
            style={[
              styles.card,
              Platform.OS === 'android' && styles.cardAndroid,
              live && styles.cardLive,
            ]}
          >
            <Text style={styles.when}>{formatVisitWhen(visit.starts_at)}</Text>
            <Text style={styles.service}>{name}</Text>
            <Text style={styles.status}>
              {visitStatusLabel(visit.status)}
              {visit.eta_minutes && visit.status === 'stylist_en_route'
                ? ` · ~${visit.eta_minutes} min`
                : ''}
            </Text>
            {visit.status === 'door_timer_active' && visit.door_timer_ends_at ? (
              <NativeDoorTimerBanner endsAt={visit.door_timer_ends_at} />
            ) : null}
            <Text style={styles.price}>{formatUsd(visit.quote_cents)}</Text>
            {visit.status === 'stylist_en_route' &&
            visit.stylist_latitude != null &&
            visit.stylist_longitude != null ? (
              <NativeLiveMap
                latitude={visit.stylist_latitude}
                longitude={visit.stylist_longitude}
                updatedAt={visit.stylist_location_updated_at}
              />
            ) : visit.status === 'stylist_en_route' ? (
              <Text style={styles.waitingMap}>
                Luke is on the way — map appears when location is shared. Message him anytime from
                Messages.
              </Text>
            ) : null}
            <NativeInspoGallery photos={visit.inspo_photos ?? []} />
            {canUploadVisitInspo(visit.status) &&
            (visit.inspo_photos?.length ?? 0) < DEFAULT_SURCHARGE_RULES.maxInspoPhotos ? (
              <NativeButton
                title="Add inspo photo"
                variant="secondary"
                onPress={() => void addInspo(visit.id)}
                isLoading={uploadBusyId === visit.id}
                style={styles.inspoBtn}
              />
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 32 },
  kicker: { ...monoLabel, color: theme.accent },
  heading: { ...displayTitle, color: theme.ink, marginBottom: 8 },
  liveHint: { fontSize: 12, color: theme.chalk, marginBottom: 12 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.line,
    marginBottom: 12,
  },
  cardLive: {
    borderColor: theme.accent,
    borderWidth: 2,
  },
  cardAndroid: { borderRadius: theme.radii.md, elevation: 1 },
  when: { fontWeight: '600', color: theme.ink },
  service: { marginTop: 4, color: theme.muted },
  status: { marginTop: 8, fontSize: 12, color: theme.chalk },
  waitingMap: {
    marginTop: 10,
    fontSize: 13,
    color: theme.muted,
    lineHeight: 18,
    padding: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paper,
  },
  price: { marginTop: 8, fontWeight: '600' },
  inspoBtn: { marginTop: 12 },
  empty: { color: theme.muted, marginTop: 8 },
  error: { color: theme.danger, marginBottom: 12 },
  feedback: { color: theme.chalk, marginBottom: 12, fontSize: 13 },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
});
