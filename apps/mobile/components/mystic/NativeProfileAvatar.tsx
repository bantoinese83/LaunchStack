import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@template/mobile-ui';
import { uploadProfileAvatar } from '../../lib/mysticApi';

type Props = {
  avatarUrl: string | null;
  name?: string;
  onUploaded?: (url: string) => void;
};

export function NativeProfileAvatar({ avatarUrl, name, onUploaded }: Props) {
  const [url, setUrl] = useState<string | null>(avatarUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  async function pick() {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Allow photo access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setBusy(true);
    const res = await uploadProfileAvatar(asset.uri, asset.fileName ?? 'avatar.jpg');
    setBusy(false);
    if (res.error || !res.url) {
      setError(res.error ?? 'Upload failed');
      return;
    }
    setUrl(res.url);
    onUploaded?.(res.url);
  }

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => void pick()} style={styles.ring} accessibilityRole="button">
        {url ? (
          <Image source={{ uri: url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        {busy ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={theme.paper} />
          </View>
        ) : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Photo</Text>
          </View>
        )}
      </Pressable>
      <Text style={styles.hint}>Luke sees your photo in Studio</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.line,
    backgroundColor: theme.accentSoft,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 32, fontWeight: '600', color: theme.accent },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(31,30,30,0.55)',
    paddingVertical: 2,
  },
  badgeText: { textAlign: 'center', fontSize: 10, color: theme.paper },
  hint: { marginTop: 8, fontSize: 12, color: theme.muted, textAlign: 'center' },
  error: { marginTop: 4, fontSize: 12, color: theme.danger },
});
