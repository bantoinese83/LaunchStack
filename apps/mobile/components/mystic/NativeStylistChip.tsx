import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MYSTIC_STYLIST } from '@template/mystic';
import { handLabel, handMuted } from '@template/mobile-ui';
import { lukePortraitSource } from '../../lib/lukeAssets';
import { NativeUserAvatar } from './NativeUserAvatar';

type Props = {
  size?: number;
  showLabel?: boolean;
  style?: object;
};

export function NativeStylistChip({ size = 26, showLabel = true, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <NativeUserAvatar source={lukePortraitSource} name={MYSTIC_STYLIST.name} size={size} />
      {showLabel ? (
        <Text style={styles.label}>
          <Text style={styles.name}>{MYSTIC_STYLIST.name}</Text>
          <Text style={styles.muted}> · your stylist</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, flexShrink: 1 },
  name: handLabel,
  muted: handMuted,
});
