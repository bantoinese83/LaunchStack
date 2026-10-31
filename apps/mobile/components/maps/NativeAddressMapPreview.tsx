import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { googleMapsDirectionsUrl, MYSTIC_RIVER_NORTH, type LatLng } from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { NativeMysticMap } from './NativeMysticMap';

type Props = {
  coords: LatLng;
  label?: string;
};

/** House-call pin preview during booking (native map, no API key on iOS). */
export function NativeAddressMapPreview({ coords, label = 'Your house call' }: Props) {
  const openMaps = () => {
    void Linking.openURL(
      googleMapsDirectionsUrl(
        { lat: coords.lat, lng: coords.lng },
        { lat: MYSTIC_RIVER_NORTH.lat, lng: MYSTIC_RIVER_NORTH.lng }
      )
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <NativeMysticMap
        height={160}
        markers={[
          {
            id: 'visit',
            latitude: coords.lat,
            longitude: coords.lng,
            title: label,
            description: 'Chicago house call',
            pinColor: theme.plum,
          },
        ]}
      />
      <Pressable onPress={openMaps} style={styles.linkRow}>
        <Text style={styles.link}>Preview route in Maps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    paddingTop: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.plum,
    marginBottom: 8,
  },
  linkRow: { paddingVertical: 10, alignItems: 'center' },
  link: { fontSize: 12, color: theme.accent, fontWeight: '600' },
});
