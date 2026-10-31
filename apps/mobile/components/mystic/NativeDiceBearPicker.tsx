import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  DICEBEAR_STYLES,
  buildDiceBearAvatarUrl,
  parseDiceBearAvatarUrl,
  sanitizeDiceBearSeed,
  type DiceBearStyleId,
} from '@template/mystic';
import { NativeButton, theme } from '@template/mobile-ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialUrl: string | null;
  defaultSeed: string;
  onSave: (url: string) => void;
  saving?: boolean;
};

export function NativeDiceBearPicker({
  visible,
  onClose,
  initialUrl,
  defaultSeed,
  onSave,
  saving = false,
}: Props) {
  const parsed = useMemo(
    () => (initialUrl ? parseDiceBearAvatarUrl(initialUrl) : null),
    [initialUrl]
  );
  const [style, setStyle] = useState<DiceBearStyleId>(parsed?.style ?? 'lorelei');
  const [seed, setSeed] = useState(parsed?.seed ?? defaultSeed);

  const previewUrl = useMemo(() => buildDiceBearAvatarUrl(style, seed, 128), [style, seed]);

  function shuffleSeed() {
    setSeed(`${defaultSeed}-${Math.random().toString(36).slice(2, 8)}`);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Choose a DiceBear avatar</Text>
          <Text style={styles.sub}>Generated art — no upload needed.</Text>

          <View style={styles.previewRow}>
            <Image source={{ uri: previewUrl }} style={styles.preview} />
            <View style={styles.seedCol}>
              <Text style={styles.label}>Seed</Text>
              <TextInput
                style={styles.input}
                value={seed}
                onChangeText={(t) => setSeed(sanitizeDiceBearSeed(t))}
                autoCapitalize="none"
              />
              <Pressable onPress={shuffleSeed}>
                <Text style={styles.link}>Randomize</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
            {DICEBEAR_STYLES.map((s) => {
              const thumb = buildDiceBearAvatarUrl(s.id, seed, 64);
              const selected = style === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setStyle(s.id)}
                  style={[styles.styleChip, selected && styles.styleChipOn]}
                >
                  <Image source={{ uri: thumb }} style={styles.styleThumb} />
                  <Text style={styles.styleLabel}>{s.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <NativeButton title="Cancel" variant="secondary" onPress={onClose} disabled={saving} />
            <NativeButton
              title={saving ? 'Saving…' : 'Use this avatar'}
              onPress={() => onSave(buildDiceBearAvatarUrl(style, seed, 256))}
              disabled={saving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(31,30,30,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.surface,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: theme.line,
  },
  title: { fontSize: 18, fontWeight: '600', color: theme.ink },
  sub: { marginTop: 4, fontSize: 13, color: theme.muted },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 },
  preview: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: theme.line },
  seedCol: { flex: 1 },
  label: { fontSize: 12, color: theme.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.ink,
    backgroundColor: theme.paper,
  },
  link: { marginTop: 8, fontSize: 12, fontWeight: '600', color: theme.accent },
  styleScroll: { marginTop: 16, maxHeight: 100 },
  styleChip: {
    alignItems: 'center',
    marginRight: 10,
    padding: 8,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paper,
  },
  styleChipOn: { borderColor: theme.accent, backgroundColor: theme.accentSoft },
  styleThumb: { width: 44, height: 44, borderRadius: 22 },
  styleLabel: { marginTop: 4, fontSize: 10, color: theme.ink },
  actions: { marginTop: 20, gap: 10 },
});
