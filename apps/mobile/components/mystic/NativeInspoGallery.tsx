import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@template/mobile-ui';

export type InspoPhoto = { id: string; public_url: string };

export function NativeInspoGallery({
  photos,
  label = 'Inspo',
}: {
  photos: InspoPhoto[];
  label?: string;
}) {
  if (!photos.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {photos.map((photo) => (
          <Pressable
            key={photo.id}
            onPress={() => void Linking.openURL(photo.public_url)}
            style={styles.thumbWrap}
          >
            <Image source={{ uri: photo.public_url }} style={styles.thumb} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: '600', color: theme.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  thumbWrap: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.line,
  },
  thumb: { width: 80, height: 80 },
});
