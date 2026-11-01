import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeButton, theme } from '@template/mobile-ui';

export const NATIVE_BOOK_STICKY_ACTIONS_HEIGHT = 112;

export type NativeBookSelectionSummary = {
  /** Primary line — usually formatted price. */
  primary: string;
  /** Secondary — e.g. duration or item count. */
  secondary?: string;
};

type Props = {
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueContent?: React.ReactNode;
  footer?: string;
  /** Fresha-style total row above Continue (service / checkout steps). */
  selectionSummary?: NativeBookSelectionSummary;
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
  selectionSummary,
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
      {selectionSummary ? (
        <View style={styles.summaryRow} accessibilityLiveRegion="polite">
          <Text style={styles.summaryPrimary}>{selectionSummary.primary}</Text>
          {selectionSummary.secondary ? (
            <Text style={styles.summarySecondary}>{selectionSummary.secondary}</Text>
          ) : null}
        </View>
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
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(250,248,244,0.96)' : theme.paper,
  },
  footer: {
    marginBottom: 8,
    paddingHorizontal: 2,
    fontSize: 12,
    lineHeight: 16,
    color: theme.muted,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  summaryPrimary: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.ink,
    letterSpacing: -0.3,
  },
  summarySecondary: {
    fontSize: 13,
    color: theme.muted,
    flexShrink: 1,
    textAlign: 'right',
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
