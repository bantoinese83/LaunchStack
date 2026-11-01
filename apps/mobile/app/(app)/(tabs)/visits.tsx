import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { NativePressableScale } from '../../../components/motion/NativePressableScale';
import {
  canUploadVisitInspo,
  DEFAULT_SURCHARGE_RULES,
  formatAddressLine,
  formatUsd,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  partitionVisitsForTabs,
  visitsTabEmptyContent,
  pickUpNextVisit,
  visitStatusLabel,
  visitAddressDestination,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { nativeScreenStyles } from '../../../components/mystic/nativeScreenStyles';
import { nativeSegmentStyles } from '../../../components/mystic/nativeSegmentStyles';
import { NativeInspoGallery } from '../../../components/mystic/NativeInspoGallery';
import { NativeVisitUpNext } from '../../../components/mystic/NativeVisitUpNext';
import { NativeServiceIllustration } from '../../../components/mystic/NativeServiceIllustration';
import { NativeStylistChip } from '../../../components/mystic/NativeStylistChip';
import { NativeDoorTimerBanner } from '../../../components/visits/NativeDoorTimerBanner';
import { NativeLiveMap } from '../../../components/visits/NativeLiveMap';
import { NativePermissionPrimer } from '../../../components/motion/NativePermissionPrimer';
import { NativeSalonLoader } from '../../../components/mystic/NativeSalonLoader';
import { hapticSoft, hapticSuccess } from '../../../lib/haptics';
import {
  fetchMyAppointments,
  releaseBookingCheckout,
  uploadInspoPhoto,
} from '../../../lib/mysticApi';

type VisitTab = 'upcoming' | 'past';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  address?: Record<string, unknown>;
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
  const [tab, setTab] = useState<VisitTab>('upcoming');
  const [inspoPrimerId, setInspoPrimerId] = useState<string | null>(null);
  const [releasingHold, setReleasingHold] = useState(false);

  const reload = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setRefreshing(true);
      void fetchMyAppointments()
        .then((data) => {
          if (data.status === 401) {
            setError('Sign in to see visits');
            router.push('/(auth)/login');
            return;
          }
          if (data.error || !data.ok) {
            setError(data.error ?? 'Could not load visits');
            return;
          }
          setError(null);
          setRows((data.appointments ?? []) as Appointment[]);
        })
        .catch(() => setError('Network error — check EXPO_PUBLIC_APP_URL'))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      reload({ silent: true });
    }, [reload])
  );

  const { upcoming, past } = useMemo(() => partitionVisitsForTabs(rows), [rows]);
  const visible = tab === 'upcoming' ? upcoming : past;
  const upNext = useMemo(
    () => (tab === 'upcoming' ? pickUpNextVisit(upcoming) : null),
    [tab, upcoming]
  );
  const listRows = useMemo(() => {
    if (!upNext || tab !== 'upcoming') return visible;
    return visible.filter((row) => row.id !== upNext.id);
  }, [tab, upNext, visible]);
  const hasLiveTracking = useMemo(() => rows.some((r) => isVisitLiveTracking(r.status)), [rows]);
  const hasPending = useMemo(() => rows.some((r) => r.status === 'pending'), [rows]);

  useEffect(() => {
    if (!hasLiveTracking && !hasPending) return;
    const ms = hasLiveTracking ? 12_000 : 45_000;
    const id = setInterval(() => reload({ silent: true }), ms);
    return () => clearInterval(id);
  }, [hasLiveTracking, hasPending, reload]);

  async function addInspo(appointmentId: string) {
    setUploadStatus(null);
    setUploadBusyId(appointmentId);
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!existing.granted) {
      setUploadBusyId(null);
      setInspoPrimerId(appointmentId);
      return;
    }
    await pickAndUploadInspo(appointmentId);
  }

  async function pickAndUploadInspo(appointmentId: string) {
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
    if (res.ok) hapticSuccess();
    setUploadStatus(
      res.ok ? 'Photo saved — Luke will see it before your visit.' : (res.error ?? 'Upload failed')
    );
    reload({ silent: true });
  }

  const tabEmpty = visitsTabEmptyContent(tab);

  return (
    <ScrollView
      style={nativeScreenStyles.scroll}
      contentContainerStyle={nativeScreenStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => reload()}
          tintColor={theme.accent}
        />
      }
    >
      <View style={nativeScreenStyles.stack}>
        <NativeScreenHeader kicker="Visits" title="Your house calls" />
        <View style={nativeSegmentStyles.shell}>
          {(
            [
              ['upcoming', `Upcoming (${upcoming.length})`],
              ['past', `Past (${past.length})`],
            ] as const
          ).map(([key, label]) => (
            <NativePressableScale
              key={key}
              skipHaptic
              onPress={() => {
                if (key !== tab) hapticSoft();
                setTab(key);
              }}
              style={[nativeSegmentStyles.tab, tab === key && nativeSegmentStyles.tabActive]}
            >
              <Text
                style={[
                  nativeSegmentStyles.tabText,
                  tab === key && nativeSegmentStyles.tabTextActive,
                ]}
              >
                {label}
              </Text>
            </NativePressableScale>
          ))}
        </View>
        {hasLiveTracking ? (
          <Text style={styles.liveHint}>Live updates while Luke is on the way</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {uploadStatus ? <Text style={styles.feedback}>{uploadStatus}</Text> : null}
        {loading ? <NativeSalonLoader copyKey="visits" style={{ paddingVertical: 24 }} /> : null}
        <NativePermissionPrimer
          visible={inspoPrimerId != null}
          title="Share inspo with Luke"
          body="Photo access lets you attach a look you love so Luke can prep before he arrives. Nothing leaves your phone until you pick a photo."
          confirmLabel="Allow photos"
          onCancel={() => setInspoPrimerId(null)}
          onConfirm={() => {
            const id = inspoPrimerId;
            setInspoPrimerId(null);
            if (id) void pickAndUploadInspo(id);
          }}
        />
        {!loading && rows.length === 0 && !error ? (
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
        {!loading && rows.length > 0 && visible.length === 0 ? (
          <NativeEmptyState
            variant="visits"
            compact
            eyebrow={tabEmpty.eyebrow}
            title={tabEmpty.title}
            description={tabEmpty.description}
            action={
              tab === 'upcoming' ? (
                <NativeButton
                  title="Book a house call"
                  onPress={() => router.push('/(app)/(tabs)/book')}
                />
              ) : undefined
            }
          />
        ) : null}
        {tab === 'upcoming' && upNext ? <NativeVisitUpNext visit={upNext} /> : null}
        {tab === 'upcoming' && listRows.length > 0 ? (
          <Text style={styles.sectionLabel}>All upcoming</Text>
        ) : null}
        {listRows.map((visit) => {
          let name = visit.service_id;
          try {
            name = getServiceById(visit.service_id as ServiceId).name;
          } catch {
            /* keep id */
          }
          const live = isVisitLiveTracking(visit.status);
          const addressLine = formatAddressLine(visit.address);
          return (
            <View
              key={visit.id}
              style={[
                nativeScreenStyles.card,
                Platform.OS === 'android' && nativeScreenStyles.cardAndroid,
                live && styles.cardLive,
              ]}
            >
              <Text style={styles.when}>{formatVisitWhen(visit.starts_at)}</Text>
              <View style={styles.serviceRow}>
                <NativeServiceIllustration serviceId={visit.service_id as ServiceId} size={48} />
                <Text style={styles.service}>{name}</Text>
              </View>
              {tab === 'upcoming' ? <NativeStylistChip size={24} style={{ marginTop: 8 }} /> : null}
              {addressLine ? <Text style={styles.address}>{addressLine}</Text> : null}
              {visit.status === 'pending' ? (
                <View style={styles.pendingNote}>
                  <Text style={styles.pendingCopy}>
                    Checkout wasn't finished — unpaid holds auto-cancel after about 90 minutes.
                    Release this slot to pick a new time.
                  </Text>
                  <NativeButton
                    title={releasingHold ? 'Releasing…' : 'Release slot & book again'}
                    variant="secondary"
                    disabled={releasingHold}
                    isLoading={releasingHold}
                    onPress={() => {
                      void (async () => {
                        setReleasingHold(true);
                        setError(null);
                        try {
                          const released = await releaseBookingCheckout();
                          if (!released.ok) {
                            setError(
                              'Could not release hold — message Luke if the slot still looks taken.'
                            );
                            return;
                          }
                          reload({ silent: true });
                          router.push('/(app)/(tabs)/book');
                        } catch {
                          setError('Could not release hold — check your connection.');
                        } finally {
                          setReleasingHold(false);
                        }
                      })();
                    }}
                    style={styles.pendingBtn}
                  />
                </View>
              ) : null}
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
                  destination={visitAddressDestination(visit.address)}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.muted,
    marginBottom: 8,
    marginTop: 4,
  },
  liveHint: { fontSize: 12, color: theme.chalk, marginBottom: 12 },
  address: { marginTop: 6, fontSize: 12, color: theme.muted },
  pendingNote: {
    marginTop: 8,
    padding: 10,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    gap: 10,
  },
  pendingCopy: { fontSize: 12, color: theme.muted, lineHeight: 17 },
  pendingBtn: { alignSelf: 'stretch' },
  cardLive: {
    backgroundColor: theme.goldSoft,
  },
  when: { fontWeight: '600', color: theme.ink },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  service: { flex: 1, color: theme.ink, fontWeight: '500' },
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
