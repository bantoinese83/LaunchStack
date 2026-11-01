import React from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeFadeIn } from './NativeFadeIn';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Explain why before the system permission sheet — users allow far more often
 * when they already know the next step.
 */
export function NativePermissionPrimer({
  visible,
  title,
  body,
  confirmLabel = 'Continue',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button">
        <NativeFadeIn rise style={styles.sheetWrap}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.eyebrow}>Quick step</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            <NativeButton title={confirmLabel} onPress={onConfirm} style={styles.confirm} />
            <NativeButton title="Not now" variant="outline" onPress={onCancel} />
          </Pressable>
        </NativeFadeIn>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,31,24,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: theme.paper,
    borderRadius: theme.radii.xl,
    padding: 20,
    paddingBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
  },
  eyebrow: { ...monoLabel, color: theme.plum, marginBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.ink,
    letterSpacing: -0.4,
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: theme.muted,
  },
  confirm: { marginTop: 20, marginBottom: 10 },
});
