import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { mysticLogoLight } from '../../constants/branding';
import { NativeFlowerField } from './NativeFlowerField';

/** Branded JS splash while fonts load — native splash hides after this. */
export function NativeLaunchSplash() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <NativeFlowerField mode="launch" count={32} opacity={0.72} />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            zIndex: 2,
          },
        ]}
      >
        <Image
          source={mysticLogoLight}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Mystic Hair Co."
        />
        <Text style={styles.kicker}>House calls · Chicago</Text>
        <Text style={styles.title}>Your blowout, at your door.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 220,
    height: 88,
    marginBottom: 28,
  },
  kicker: {
    ...monoLabel,
    color: theme.plum,
    marginBottom: 8,
  },
  title: {
    ...displayTitle,
    fontSize: 26,
    color: theme.ink,
    textAlign: 'center',
    maxWidth: 300,
  },
});
