import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MYSTIC_STYLIST, mysticStylistPortraitUrl } from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { NativeUserAvatar } from './NativeUserAvatar';

const stylistPortraitUrl = mysticStylistPortraitUrl(process.env.EXPO_PUBLIC_APP_URL);

type Props = {
  size?: number;
  showLabel?: boolean;
  style?: object;
};

export function NativeStylistChip({ size = 26, showLabel = true, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <NativeUserAvatar url={stylistPortraitUrl} name={MYSTIC_STYLIST.name} size={size} />
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
  name: { fontWeight: '600', color: theme.ink },
  muted: { color: theme.muted },
});
