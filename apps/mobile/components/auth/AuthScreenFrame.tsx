import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeScreen } from '@template/mobile-ui';

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

/** Full-bleed paper auth canvas — no floating card on a dark frame. */
export function AuthScreenFrame({ children, contentStyle }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <NativeScreen style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          },
          contentStyle,
        ]}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
});
