import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatRelativeUpdatedAt,
  googleMapsDirectionsUrl,
  isLocationUpdateFresh,
  stylistLiveMapUrl,
  type LatLng,
} from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { NativeMysticMap, type NativeMapMarker } from '../maps/NativeMysticMap';

type Props = {
  latitude: number;
  longitude: number;
  updatedAt?: string | null;
  /** Client house-call pin when en route. */
  destination?: LatLng | null;
};

export function NativeLiveMap({ latitude, longitude, updatedAt, destination }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const fresh = isLocationUpdateFresh(updatedAt);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const markers = useMemo((): NativeMapMarker[] => {
    const rows: NativeMapMarker[] = [
      {
        id: 'stylist',
        latitude,
        longitude,
        title: 'Luke',
        description: fresh ? 'On the way' : 'Last known location',
        pinColor: theme.accent,
      },
    ];
    if (destination) {
      rows.push({
        id: 'client',
        latitude: destination.lat,
        longitude: destination.lng,
        title: 'Your visit',
        description: 'House call',
        pinColor: theme.plum,
      });
    }
    return rows;
  }, [destination, fresh, latitude, longitude]);

  const externalUrl = destination
    ? googleMapsDirectionsUrl(destination, { lat: latitude, lng: longitude })
    : stylistLiveMapUrl(latitude, longitude);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {fresh ? <View style={styles.liveDot} /> : null}
          <Text style={styles.headerTitle}>
            {destination ? 'Luke · en route to you' : 'Luke on the map'}
          </Text>
        </View>
        {updatedAt ? (
          <Text style={styles.headerMeta}>{formatRelativeUpdatedAt(updatedAt, now)}</Text>
        ) : null}
      </View>
      <NativeMysticMap markers={markers} height={200} />
      <Pressable onPress={() => void Linking.openURL(externalUrl)} style={styles.external}>
        <Text style={styles.externalText}>
          {destination ? 'Directions in Google Maps' : 'Open in Google Maps'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    backgroundColor: theme.paper,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.gold,
  },
  headerTitle: { fontSize: 12, fontWeight: '600', color: theme.ink },
  headerMeta: { fontSize: 11, color: theme.muted },
  external: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  externalText: { fontSize: 12, color: theme.plum, fontWeight: '600' },
});
