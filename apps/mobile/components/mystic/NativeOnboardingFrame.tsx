import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeScreen, theme } from '@template/mobile-ui';
import { NativeFlowerField } from './NativeFlowerField';

export const NATIVE_ONBOARDING_FOOTER_HEIGHT = 108;

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer: React.ReactNode;
  contentStyle?: ViewStyle;
};

/** Full-screen onboarding — safe areas, scroll body, sticky footer (Mobbin-style). */
export function NativeOnboardingFrame({ children, header, footer, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12) + 4;
  const bottomPad = Math.max(insets.bottom, 12) + NATIVE_ONBOARDING_FOOTER_HEIGHT;

  return (
    <NativeScreen style={styles.screen}>
      <StatusBar style="dark" />
      <NativeFlowerField mode="idle" count={18} opacity={0.32} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={topPad}
      >
        <View style={[styles.header, { paddingTop: topPad }]}>{header}</View>
        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }, contentStyle]}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1, zIndex: 1 },
  header: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    backgroundColor: theme.paper,
  },
});
