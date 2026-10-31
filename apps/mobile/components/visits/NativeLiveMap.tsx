import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {
  formatRelativeUpdatedAt,
  isLocationUpdateFresh,
  mapRegionFromCenter,
  stylistLiveMapUrl,
} from '@template/mystic';
import { theme } from '@template/mobile-ui';

type Props = {
  latitude: number;
  longitude: number;
  updatedAt?: string | null;
};

export function NativeLiveMap({ latitude, longitude, updatedAt }: Props) {
  const mapRef = useRef<MapView>(null);
  const region = mapRegionFromCenter(latitude, longitude);
  const [now, setNow] = useState(() => Date.now());
  const fresh = isLocationUpdateFresh(updatedAt);

  useEffect(() => {
    mapRef.current?.animateToRegion(mapRegionFromCenter(latitude, longitude), 450);
  }, [latitude, longitude]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {fresh ? <View style={styles.liveDot} /> : null}
          <Text style={styles.headerTitle}>Luke on the map</Text>
        </View>
        {updatedAt ? (
          <Text style={styles.headerMeta}>{formatRelativeUpdatedAt(updatedAt, now)}</Text>
        ) : null}
      </View>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation={false}>
        <Marker
          coordinate={{ latitude, longitude }}
          title="Luke"
          description="On the way to your house call"
        />
      </MapView>
      <Pressable
        onPress={() => void Linking.openURL(stylistLiveMapUrl(latitude, longitude))}
        style={styles.external}
      >
        <Text style={styles.externalText}>Open in Google Maps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
  },
  headerTitle: { fontSize: 12, fontWeight: '600', color: theme.ink },
  headerMeta: { fontSize: 11, color: theme.muted },
  map: { width: '100%', height: 200 },
  external: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.line,
  },
  externalText: { fontSize: 12, color: theme.accent, fontWeight: '600' },
});
