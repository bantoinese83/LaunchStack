import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { theme } from '@template/mobile-ui';

type Props = {
  style?: ViewStyle;
  /** Compact under titles; default is the poster-width stripe. */
  compact?: boolean;
};

/** Gold · plum · sage mileage stripe — brand atmosphere without decoration noise. */
export function NativeRoadStripe({ style, compact = false }: Props) {
  return (
    <View
      style={[styles.stripe, compact && styles.compact, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.seg, styles.gold]} />
      <View style={[styles.seg, styles.plum]} />
      <View style={[styles.seg, styles.sage]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    maxWidth: 120,
    overflow: 'hidden',
    borderRadius: 1,
    marginBottom: 12,
  },
  compact: {
    maxWidth: 72,
    height: 2,
    marginBottom: 8,
  },
  seg: { height: '100%' },
  gold: { flex: 5, backgroundColor: theme.gold },
  plum: { flex: 2, backgroundColor: theme.plum },
  sage: { flex: 3, backgroundColor: theme.accent },
});
