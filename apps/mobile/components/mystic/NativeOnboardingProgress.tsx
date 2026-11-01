import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  MYSTIC_ONBOARDING_STEP_HINT,
  MYSTIC_ONBOARDING_STEP_LABEL,
  MYSTIC_ONBOARDING_STEPS,
  mysticOnboardingStepIndex,
  type MysticOnboardingStep,
} from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';

type Props = {
  step: MysticOnboardingStep;
};

export function NativeOnboardingProgress({ step }: Props) {
  const currentIndex = mysticOnboardingStepIndex(step);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: MYSTIC_ONBOARDING_STEPS.length,
        now: currentIndex + 1,
      }}
    >
      <View style={styles.trackRow}>
        {MYSTIC_ONBOARDING_STEPS.map((id, index) => (
          <View
            key={id}
            style={[styles.segment, index <= currentIndex ? styles.segmentOn : styles.segmentOff]}
          />
        ))}
      </View>
      <Text style={styles.stepMeta}>
        Step {currentIndex + 1} of {MYSTIC_ONBOARDING_STEPS.length} ·{' '}
        {MYSTIC_ONBOARDING_STEP_LABEL[step]}
      </Text>
      <Text style={styles.hint}>{MYSTIC_ONBOARDING_STEP_HINT[step]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  trackRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  segmentOn: { backgroundColor: theme.gold },
  segmentOff: { backgroundColor: theme.line },
  stepMeta: {
    ...monoLabel,
    marginTop: 10,
    fontSize: 10,
    color: theme.muted,
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: theme.plum,
  },
});
