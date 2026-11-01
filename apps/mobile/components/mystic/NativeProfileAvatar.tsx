import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeAvatarMarquee } from './NativeAvatarMarquee';
import { NativePermissionPrimer } from '../motion/NativePermissionPrimer';
import { hapticSuccess } from '../../lib/haptics';
import { saveDiceBearAvatar, uploadProfileAvatar } from '../../lib/mysticApi';

type Props = {
  avatarUrl: string | null;
  name?: string;
  diceBearDefaultSeed?: string;
  onUploaded?: (url: string) => void;
};

type PendingSource = 'library' | 'camera' | null;

export function NativeProfileAvatar({ avatarUrl, name, diceBearDefaultSeed, onUploaded }: Props) {
  const [url, setUrl] = useState<string | null>(avatarUrl);
  useEffect(() => {
    setUrl(avatarUrl);
  }, [avatarUrl]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<PendingSource>(null);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const seedDefault = diceBearDefaultSeed?.trim() || name?.trim() || 'mystic';

  async function uploadFromAsset(asset: ImagePicker.ImagePickerAsset) {
    setBusy(true);
    setError(null);
    try {
      const res = await uploadProfileAvatar(
        asset.uri,
        asset.fileName ?? 'avatar.jpg',
        asset.mimeType ?? 'image/jpeg'
      );
      if (res.error || !res.url) {
        setError(res.error ?? 'Upload failed');
        return;
      }
      hapticSuccess();
      setUrl(`${res.url}${res.url.includes('?') ? '&' : '?'}t=${Date.now()}`);
      onUploaded?.(res.url);
    } catch {
      setError('Upload failed — check connection');
    } finally {
      setBusy(false);
    }
  }

  async function runLibrary() {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Allow photo access in Settings');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    await uploadFromAsset(result.assets[0]);
  }

  async function runCamera() {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Allow camera access in Settings');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    await uploadFromAsset(result.assets[0]);
  }

  async function pickLibrary() {
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!existing.granted) {
      setPendingSource('library');
      return;
    }
    await runLibrary();
  }

  async function takeSelfie() {
    const existing = await ImagePicker.getCameraPermissionsAsync();
    if (!existing.granted) {
      setPendingSource('camera');
      return;
    }
    await runCamera();
  }

  async function pickGenerated(style: string, seed: string) {
    setBusy(true);
    setError(null);
    const res = await saveDiceBearAvatar(style, seed);
    setBusy(false);
    if (res.error || !res.url) {
      setError(res.error ?? 'Could not save');
      return;
    }
    hapticSuccess();
    setUrl(res.url);
    onUploaded?.(res.url);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
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
        ) : null}
      </View>

      <View style={styles.actions}>
        <NativeButton
          title="Selfie"
          variant="secondary"
          onPress={() => void takeSelfie()}
          disabled={busy}
        />
        <NativeButton
          title="Photo"
          variant="secondary"
          onPress={() => void pickLibrary()}
          disabled={busy}
        />
      </View>

      <NativeAvatarMarquee
        defaultSeed={seedDefault}
        selectedUrl={url}
        busy={busy}
        onPick={(style, seed) => void pickGenerated(style, seed)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <NativePermissionPrimer
        visible={pendingSource === 'library'}
        title="Add a photo"
        body="Choose a headshot from your library."
        confirmLabel="Continue"
        onCancel={() => setPendingSource(null)}
        onConfirm={() => {
          setPendingSource(null);
          void runLibrary();
        }}
      />
      <NativePermissionPrimer
        visible={pendingSource === 'camera'}
        title="Take a selfie"
        body="Snap a quick headshot in-app."
        confirmLabel="Continue"
        onCancel={() => setPendingSource(null)}
        onConfirm={() => {
          setPendingSource(null);
          void runCamera();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16, width: '100%' },
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
  actions: { marginTop: 12, width: '100%', gap: 8 },
  error: { marginTop: 8, fontSize: 12, color: theme.danger },
});
