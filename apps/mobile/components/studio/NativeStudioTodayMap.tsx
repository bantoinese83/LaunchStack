import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  addressLatLng,
  formatAddressLine,
  formatVisitWhen,
  getServiceById,
  googleMapsDirectionsUrl,
  isVisitLiveTracking,
  type ServiceId,
} from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeMysticMap, type NativeMapMarker } from '../maps/NativeMysticMap';
import { fetchGeocodeBatch } from '../../lib/studioApi';
import type { StudioAppointment, StudioClientRow } from './NativeStudioOps';

type Props = {
  workspaceId: string;
  appointments: StudioAppointment[];
  clientsById: Record<string, StudioClientRow>;
};

export function NativeStudioTodayMap({ workspaceId, appointments, clientsById }: Props) {
  const [geocoded, setGeocoded] = useState<Record<string, { lat: number; lng: number }>>({});
  const [loading, setLoading] = useState(false);

  const active = useMemo(
    () => appointments.filter((a) => !['canceled', 'no_show', 'completed'].includes(a.status)),
    [appointments]
  );

  useEffect(() => {
    if (!workspaceId || active.length === 0) {
      setGeocoded({});
      return;
    }
    const missing = active.filter((a) => !addressLatLng(a.address));
    if (missing.length === 0) {
      setGeocoded({});
      return;
    }
    setLoading(true);
    void fetchGeocodeBatch(
      workspaceId,
      missing.map((a) => ({
        id: a.id,
        address: a.address ?? {},
        label: formatAddressLine(a.address) ?? undefined,
      }))
    )
      .then((markers) => {
        const next: Record<string, { lat: number; lng: number }> = {};
        for (const m of markers) {
          next[m.id] = { lat: m.lat, lng: m.lng };
        }
        setGeocoded(next);
      })
      .finally(() => setLoading(false));
  }, [active, workspaceId]);

  const { mapMarkers, firstClientStop } = useMemo(() => {
    const rows: NativeMapMarker[] = [];
    let firstClient: { lat: number; lng: number } | null = null;

    for (const appt of active) {
      const coords = addressLatLng(appt.address) ?? geocoded[appt.id];
      if (!coords) continue;

      let serviceName = appt.service_id;
      try {
        serviceName = getServiceById(appt.service_id as ServiceId).name;
      } catch {
        /* keep id */
      }
      const client = clientsById[appt.client_user_id];
      const live = isVisitLiveTracking(appt.status);

      if (!firstClient) firstClient = { lat: coords.lat, lng: coords.lng };

      rows.push({
        id: `client-${appt.id}`,
        latitude: coords.lat,
        longitude: coords.lng,
        title: client?.full_name?.split(' ')[0] ?? 'Client',
        description: `${serviceName} · ${formatVisitWhen(appt.starts_at)}`,
        pinColor: live ? theme.gold : theme.plum,
        tone: 'client',
        avatarUrl: client?.avatar_url ?? null,
        avatarName: client?.full_name ?? 'Client',
      });

      if (
        appt.stylist_latitude != null &&
        appt.stylist_longitude != null &&
        appt.status === 'stylist_en_route'
      ) {
        rows.push({
          id: `stylist-${appt.id}`,
          latitude: appt.stylist_latitude,
          longitude: appt.stylist_longitude,
          title: 'Luke',
          description: 'Live · en route',
          pinColor: theme.accent,
          tone: 'stylist',
        });
      }
    }

    return { mapMarkers: rows, firstClientStop: firstClient };
  }, [active, clientsById, geocoded]);

  if (active.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Today on the map</Text>
      {loading && mapMarkers.length === 0 ? (
        <Text style={styles.hint}>Loading stops…</Text>
      ) : mapMarkers.length === 0 ? (
        <Text style={styles.hint}>Add addresses to see house calls on the map.</Text>
      ) : (
        <>
          <NativeMysticMap markers={mapMarkers} height={220} />
          {firstClientStop ? (
            <Pressable
              style={styles.link}
              onPress={() =>
                void Linking.openURL(
                  googleMapsDirectionsUrl({ lat: firstClientStop.lat, lng: firstClientStop.lng })
                )
              }
            >
              <Text style={styles.linkText}>Directions to next stop</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  kicker: { ...monoLabel, color: theme.plum, marginBottom: 8 },
  hint: { fontSize: 13, color: theme.muted, marginBottom: 8 },
  link: { paddingVertical: 12, alignItems: 'center' },
  linkText: { fontSize: 13, fontWeight: '600', color: theme.plum },
});
