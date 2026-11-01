import React from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { mysticLogoLight } from '../../constants/branding';

type Props = {
  style?: ViewStyle;
};

/** Logo + copy overlay — pair with a persistent `NativeFlowerField` behind. */
export function NativeLaunchSplashContent({ style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        },
        style,
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
  );
}

const styles = StyleSheet.create({
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
