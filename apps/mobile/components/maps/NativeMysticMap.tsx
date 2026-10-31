import React, { useEffect, useMemo, useRef } from 'react';
import { Image, Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import {
  MYSTIC_STYLIST,
  mapRegionForLatLngs,
  mysticStylistPortraitUrl,
  type LatLng,
} from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { NativeUserAvatar } from '../mystic/NativeUserAvatar';

const stylistPortraitUrl = mysticStylistPortraitUrl(process.env.EXPO_PUBLIC_APP_URL);

export type NativeMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  /** iOS pin tint when using default pin */
  pinColor?: string;
  tone?: 'client' | 'stylist';
  avatarUrl?: string | null;
  avatarName?: string;
};

function markerAvatar(m: NativeMapMarker) {
  if (m.avatarUrl !== undefined || m.avatarName) {
    return { url: m.avatarUrl ?? null, name: m.avatarName ?? m.title ?? '?' };
  }
  if (m.tone === 'stylist') {
    return { url: stylistPortraitUrl, name: MYSTIC_STYLIST.name };
  }
  return { url: m.avatarUrl ?? null, name: m.avatarName ?? m.title ?? 'Client' };
}

type Props = {
  markers: NativeMapMarker[];
  height?: number;
  style?: ViewStyle;
  /** Called once MapView is ready (for fitToCoordinates). */
  onReady?: () => void;
};

function markersToLatLngs(markers: NativeMapMarker[]): LatLng[] {
  return markers.map((m) => ({ lat: m.latitude, lng: m.longitude }));
}

export function NativeMysticMap({ markers, height = 200, style, onReady }: Props) {
  const mapRef = useRef<MapView>(null);
  const region = useMemo((): Region => {
    const r = mapRegionForLatLngs(markersToLatLngs(markers));
    return r;
  }, [markers]);

  useEffect(() => {
    if (markers.length < 2) {
      mapRef.current?.animateToRegion(region, 400);
      return;
    }
    mapRef.current?.fitToCoordinates(
      markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
      {
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
        animated: true,
      }
    );
  }, [markers, region]);

  if (markers.length === 0) return null;

  return (
    <View style={[styles.wrap, { height }, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onMapReady={() => onReady?.()}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
      >
        {markers.map((m) => {
          const avatar = markerAvatar(m);
          return (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              tracksViewChanges={false}
            >
              <View style={styles.pin}>
                {avatar.url ? (
                  <Image source={{ uri: avatar.url }} style={styles.pinImg} />
                ) : (
                  <NativeUserAvatar url={null} name={avatar.name} size={32} />
                )}
              </View>
              {m.title ? (
                <Callout tooltip>
                  <View style={styles.callout}>
                    <NativeUserAvatar url={avatar.url} name={avatar.name} size={28} />
                    <View style={styles.calloutText}>
                      <Text style={styles.calloutTitle}>{m.title}</Text>
                      {m.description ? (
                        <Text style={styles.calloutSub}>{m.description}</Text>
                      ) : null}
                    </View>
                  </View>
                </Callout>
              ) : null}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.gold,
    backgroundColor: theme.paper,
    overflow: 'hidden',
  },
  pinImg: { width: 32, height: 32, borderRadius: 16 },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    maxWidth: 220,
    backgroundColor: theme.paper,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
  },
  calloutText: { flex: 1, minWidth: 0 },
  calloutTitle: { fontSize: 12, fontWeight: '600', color: theme.ink },
  calloutSub: { fontSize: 11, color: theme.muted, marginTop: 2 },
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: theme.line,
  },
});
