import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import {
  addressLatLng,
  formatAddressLine,
  formatAppointmentTagLabels,
  formatVisitWhen,
  getServiceById,
  googleMapsDirectionsUrl,
  clampEnRouteEtaMinutes,
  isVisitLiveTracking,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { NativeInspoGallery } from '../mystic/NativeInspoGallery';
import { NativeUserAvatar } from '../mystic/NativeUserAvatar';
import { fetchAppointmentInspo, shareStylistLocation, studioPost } from '../../lib/studioApi';

export type StudioClientRow = {
  user_id: string;
  full_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

export type StudioAppointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
  address?: Record<string, unknown>;
  tags?: string[];
  client_notes?: string | null;
  stylist_latitude?: number | null;
  stylist_longitude?: number | null;
};

export function NativeStudioOps({
  appointments,
  clientsById,
  onChanged,
  hideGlobalEta = false,
}: {
  appointments: StudioAppointment[];
  clientsById: Record<string, StudioClientRow>;
  onChanged: () => void;
  /** When split into Today / Coming up sections, ETA field only on first block. */
  hideGlobalEta?: boolean;
}) {
  const router = useRouter();
  const [eta, setEta] = useState('20');
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inspoById, setInspoById] = useState<Record<string, { id: string; public_url: string }[]>>(
    {}
  );

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const liveA = isVisitLiveTracking(a.status) ? 0 : 1;
      const liveB = isVisitLiveTracking(b.status) ? 0 : 1;
      if (liveA !== liveB) return liveA - liveB;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });
  }, [appointments]);

  const idKey = useMemo(() => appointments.map((a) => a.id).join(','), [appointments]);

  useEffect(() => {
    if (!idKey) {
      setInspoById({});
      return;
    }
    void Promise.all(
      idKey.split(',').map(async (id) => {
        const data = await fetchAppointmentInspo(id);
        return { id, photos: data.photos ?? [] };
      })
    ).then((rows) => {
      const next: Record<string, { id: string; public_url: string }[]> = {};
      for (const row of rows) next[row.id] = row.photos;
      setInspoById(next);
    });
  }, [idKey]);

  function clientLabel(clientUserId: string) {
    const c = clientsById[clientUserId];
    return c?.full_name ?? c?.email ?? `Client ${clientUserId.slice(0, 8)}`;
  }

  async function readCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }

  async function enRoute(id: string) {
    setBusyId(id);
    setMessage(null);
    const coords = await readCoords();
    const body: Record<string, unknown> = {
      appointmentId: id,
      etaMinutes: clampEnRouteEtaMinutes(eta),
    };
    if (coords) {
      body.latitude = coords.latitude;
      body.longitude = coords.longitude;
    }
    const result = (await studioPost('/api/mystic/appointments/en-route', body)) as {
      ok: boolean;
      error?: string;
    };
    setBusyId(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Failed');
      return;
    }
    setMessage(
      coords ? 'On the way + live map shared' : 'On the way (enable location to share map)'
    );
    onChanged();
  }

  async function shareLive(id: string) {
    setBusyId(id);
    const coords = await readCoords();
    if (!coords) {
      setBusyId(null);
      setMessage('Allow location to share live map');
      return;
    }
    const result = await shareStylistLocation(id, coords.latitude, coords.longitude);
    setBusyId(null);
    setMessage(result.ok ? 'Location updated' : (result.error ?? 'Update failed'));
    onChanged();
  }

  async function run(id: string, path: string, body: Record<string, unknown>, success: string) {
    setBusyId(id);
    setMessage(null);
    const result = (await studioPost(path, body)) as { ok: boolean; error?: string };
    setBusyId(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Action failed');
      return;
    }
    setMessage(success);
    onChanged();
  }

  if (appointments.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {message ? <Text style={styles.status}>{message}</Text> : null}
      {!hideGlobalEta ? (
        <>
          <Text style={styles.label}>ETA (minutes)</Text>
          <TextInput
            value={eta}
            onChangeText={setEta}
            keyboardType="number-pad"
            style={styles.input}
          />
        </>
      ) : null}
      {sorted.map((row) => {
        let serviceName = row.service_id.replace(/_/g, ' ');
        try {
          serviceName = getServiceById(row.service_id as ServiceId).name;
        } catch {
          /* keep id */
        }
        const isEnRoute = row.status === 'stylist_en_route';
        const live = isVisitLiveTracking(row.status);
        const addressLine = formatAddressLine(row.address);
        const coords = addressLatLng(row.address);
        const directionsUrl = coords
          ? googleMapsDirectionsUrl(coords)
          : addressLine
            ? googleMapsDirectionsUrl(addressLine)
            : null;
        const tagLine = row.tags?.length ? formatAppointmentTagLabels(row.tags).join(' · ') : null;

        return (
          <View key={row.id} style={[styles.card, live ? styles.cardLive : null]}>
            <Text style={styles.title}>{serviceName}</Text>
            <View style={styles.clientRow}>
              <NativeUserAvatar
                url={clientsById[row.client_user_id]?.avatar_url}
                name={clientLabel(row.client_user_id)}
                size={28}
              />
              <Text style={styles.clientName}>{clientLabel(row.client_user_id)}</Text>
            </View>
            <Text style={styles.meta}>
              {formatVisitWhen(row.starts_at)} · {visitStatusLabel(row.status)}
            </Text>
            {addressLine ? <Text style={styles.address}>{addressLine}</Text> : null}
            {tagLine ? <Text style={styles.tags}>{tagLine}</Text> : null}
            {row.client_notes?.trim() ? (
              <Text style={styles.notes}>
                <Text style={styles.notesLabel}>Notes: </Text>
                {row.client_notes.trim()}
              </Text>
            ) : null}
            {directionsUrl ? (
              <Pressable onPress={() => void Linking.openURL(directionsUrl)}>
                <Text style={styles.link}>Directions in Google Maps</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/studio/thread/[clientUserId]',
                  params: {
                    clientUserId: row.client_user_id,
                    clientName: clientLabel(row.client_user_id),
                    clientAvatarUrl: clientsById[row.client_user_id]?.avatar_url ?? '',
                  },
                })
              }
            >
              <Text style={styles.link}>Message client</Text>
            </Pressable>
            <NativeInspoGallery photos={inspoById[row.id] ?? []} label="Client inspo" />
            <View style={styles.actions}>
              <NativeButton
                title="On the way"
                onPress={() => void enRoute(row.id)}
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title={isEnRoute ? 'Update live map' : 'Live map (after on the way)'}
                variant="outline"
                disabled={!isEnRoute}
                onPress={() => void shareLive(row.id)}
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="Door timer"
                variant="secondary"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/door-timer',
                    { appointmentId: row.id },
                    'Door timer started'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="Complete"
                variant="outline"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/complete',
                    { appointmentId: row.id },
                    'Visit complete'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="No-show"
                variant="danger"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/no-show',
                    { appointmentId: row.id },
                    'No-show recorded'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  status: { color: theme.chalk, fontSize: 13 },
  label: { ...monoLabel, color: theme.plum, marginTop: 4 },
  input: {
    ...roadTrip.flatInput,
    marginBottom: 12,
  },
  card: {
    ...roadTrip.section,
    paddingHorizontal: 0,
  },
  cardLive: {
    backgroundColor: theme.goldSoft,
    borderLeftWidth: 3,
    borderLeftColor: theme.gold,
    paddingLeft: 12,
  },
  title: { fontWeight: '600', color: theme.ink, textTransform: 'capitalize' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  clientName: { fontWeight: '600', color: theme.ink, flex: 1 },
  meta: { marginTop: 4, fontSize: 13, color: theme.muted },
  address: { marginTop: 6, fontSize: 12, color: theme.muted },
  tags: { marginTop: 4, fontSize: 12, color: theme.chalk },
  notes: { marginTop: 4, fontSize: 12, color: theme.muted },
  notesLabel: { fontWeight: '600', color: theme.ink },
  link: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: theme.accent,
    textDecorationLine: 'underline',
  },
  actions: { marginTop: 12, gap: 8 },
  actionBtn: { width: '100%' },
});
