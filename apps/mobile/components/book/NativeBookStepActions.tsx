import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeButton, theme } from '@template/mobile-ui';

export const NATIVE_BOOK_STICKY_ACTIONS_HEIGHT = 88;

type Props = {
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueContent?: React.ReactNode;
  footer?: string;
};

/** Fixed back / continue bar — stays visible while scrolling long book steps. */
export function NativeBookStepActions({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled,
  continueLoading,
  continueContent,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <View
      style={[styles.wrap, { paddingBottom: bottomPad }]}
      accessibilityRole="toolbar"
      accessibilityLabel="Booking step actions"
    >
      {footer ? (
        <Text style={styles.footer} accessibilityLiveRegion="polite">
          {footer}
        </Text>
      ) : null}
      <View style={styles.row}>
        <NativeButton title={backLabel} variant="secondary" onPress={onBack} style={styles.half} />
        <NativeButton
          title={continueLabel}
          onPress={onContinue}
          disabled={continueDisabled}
          isLoading={continueLoading}
          content={continueContent}
          style={styles.half}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(250,248,244,0.94)' : theme.paper,
    shadowColor: '#1a1f18',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  footer: {
    marginBottom: 8,
    paddingHorizontal: 2,
    fontSize: 12,
    lineHeight: 16,
    color: theme.muted,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
