import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildDiceBearGallery, parseDiceBearAvatarUrl } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeRoadStripe } from './NativeRoadStripe';

type Props = {
  defaultSeed: string;
  selectedUrl: string | null;
  busy?: boolean;
  onPick: (style: string, seed: string) => void;
};

export function NativeAvatarMarquee({ defaultSeed, selectedUrl, busy = false, onPick }: Props) {
  const [shuffleKey, setShuffleKey] = useState('');
  const gallery = useMemo(
    () => buildDiceBearGallery(defaultSeed, { variants: 3, size: 96, shuffleKey }),
    [defaultSeed, shuffleKey]
  );
  const selected = useMemo(
    () => (selectedUrl ? parseDiceBearAvatarUrl(selectedUrl) : null),
    [selectedUrl]
  );

  return (
    <View style={styles.wrap}>
      <NativeRoadStripe compact style={styles.stripe} />
      <View style={styles.header}>
        <Text style={styles.kicker}>Looks</Text>
        <Pressable
          disabled={busy}
          onPress={() => setShuffleKey(Math.random().toString(36).slice(2, 8))}
          hitSlop={8}
        >
          <Text style={[styles.shuffle, busy && styles.dim]}>Shuffle</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        <View style={styles.grid}>
          {gallery.map((item) => {
            const isOn = selected?.style === item.style && selected.seed === item.seed;
            return (
              <Pressable
                key={item.id}
                disabled={busy}
                onPress={() => onPick(item.style, item.seed)}
                style={[styles.cell, isOn && styles.cellOn, busy && styles.dim]}
              >
                <Image source={{ uri: item.url }} style={styles.thumb} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  stripe: { marginBottom: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kicker: { ...monoLabel, color: theme.chalk },
  shuffle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.plum,
    letterSpacing: 0.2,
  },
  dim: { opacity: 0.45 },
  scrollContent: { paddingRight: 4 },
  grid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 124,
    gap: 8,
  },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.line,
    marginRight: 8,
    backgroundColor: theme.surface,
  },
  cellOn: {
    borderColor: theme.gold,
    borderWidth: 2.5,
  },
  thumb: { width: '100%', height: '100%' },
});
