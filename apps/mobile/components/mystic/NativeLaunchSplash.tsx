import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@template/mobile-ui';
import { NativeFlowerField } from './NativeFlowerField';
import { NativeLaunchSplashContent } from './NativeLaunchSplashContent';

/** Standalone splash (preview / legacy). Root layout uses persistent flowers + crossfade. */
export function NativeLaunchSplash() {
  return (
    <View style={styles.root}>
      <NativeFlowerField mode="launch" count={24} opacity={0.72} />
      <NativeLaunchSplashContent style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
});
