import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { parseDiceBearAvatarUrl } from '@template/mystic';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeDiceBearPicker } from './NativeDiceBearPicker';
import { saveDiceBearAvatar, uploadProfileAvatar } from '../../lib/mysticApi';

type Props = {
  avatarUrl: string | null;
  name?: string;
  diceBearDefaultSeed?: string;
  onUploaded?: (url: string) => void;
};

export function NativeProfileAvatar({ avatarUrl, name, diceBearDefaultSeed, onUploaded }: Props) {
  const [url, setUrl] = useState<string | null>(avatarUrl);
  useEffect(() => {
    setUrl(avatarUrl);
  }, [avatarUrl]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diceVisible, setDiceVisible] = useState(false);
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const seedDefault = diceBearDefaultSeed?.trim() || name?.trim() || 'mystic';

  async function uploadFromAsset(asset: ImagePicker.ImagePickerAsset) {
    setBusy(true);
    setError(null);
    const res = await uploadProfileAvatar(asset.uri, asset.fileName ?? 'avatar.jpg');
    setBusy(false);
    if (res.error || !res.url) {
      setError(res.error ?? 'Upload failed');
      return;
    }
    setUrl(res.url);
    onUploaded?.(res.url);
  }

  async function pickLibrary() {
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

  async function takeSelfie() {
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

  async function confirmDiceBear(nextUrl: string) {
    const parsed = parseDiceBearAvatarUrl(nextUrl);
    if (!parsed) {
      setError('Invalid DiceBear avatar');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await saveDiceBearAvatar(parsed.style, parsed.seed);
    setBusy(false);
    if (res.error || !res.url) {
      setError(res.error ?? 'Could not save avatar');
      return;
    }
    setUrl(res.url);
    onUploaded?.(res.url);
    setDiceVisible(false);
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
          title="Upload"
          variant="secondary"
          onPress={() => void pickLibrary()}
          disabled={busy}
        />
        <NativeButton title="DiceBear" onPress={() => setDiceVisible(true)} disabled={busy} />
      </View>

      <Text style={styles.hint}>
        Uploads use profile storage; DiceBear saves as a link. Luke sees either in Studio.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <NativeDiceBearPicker
        visible={diceVisible}
        onClose={() => setDiceVisible(false)}
        initialUrl={url}
        defaultSeed={seedDefault}
        onSave={(next) => void confirmDiceBear(next)}
        saving={busy}
      />
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
  actions: { marginTop: 12, width: '100%', gap: 8 },
  hint: { marginTop: 8, fontSize: 12, color: theme.muted, textAlign: 'center' },
  error: { marginTop: 4, fontSize: 12, color: theme.danger },
});
