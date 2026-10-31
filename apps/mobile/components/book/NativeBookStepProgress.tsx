import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BOOKING_FLOW_STEPS,
  BOOKING_FLOW_STEP_HINT,
  BOOKING_FLOW_STEP_LABEL,
  bookingFlowStepIndex,
  canNavigateToBookingStep,
  type BookingFlowStep,
} from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';

type Props = {
  step: BookingFlowStep;
  onStepChange?: (step: BookingFlowStep) => void;
};

export function NativeBookStepProgress({ step, onStepChange }: Props) {
  const currentIndex = bookingFlowStepIndex(step);
  const progress = ((currentIndex + 1) / BOOKING_FLOW_STEPS.length) * 100;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: BOOKING_FLOW_STEPS.length, now: currentIndex + 1 }}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.steps}>
        {BOOKING_FLOW_STEPS.map((id, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = onStepChange && canNavigateToBookingStep(step, id);
          const dot = (
            <View style={[styles.dot, active && styles.dotActive, done && styles.dotDone]}>
              <Text
                style={[styles.dotText, active && styles.dotTextOn, done && styles.dotTextDone]}
              >
                {done ? '✓' : index + 1}
              </Text>
            </View>
          );
          return (
            <View key={id} style={styles.stepCol}>
              {reachable ? (
                <Pressable
                  onPress={() => onStepChange!(id)}
                  accessibilityRole="button"
                  accessibilityLabel={BOOKING_FLOW_STEP_LABEL[id]}
                  accessibilityState={{ selected: active }}
                >
                  {dot}
                </Pressable>
              ) : (
                dot
              )}
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]} numberOfLines={1}>
                {BOOKING_FLOW_STEP_LABEL[id]}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>{BOOKING_FLOW_STEP_HINT[step]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 4,
  },
  stepCol: { flex: 1, alignItems: 'center', minWidth: 0 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  dotDone: { backgroundColor: `${theme.accent}33`, borderColor: theme.accent },
  dotText: { fontSize: 11, fontWeight: '600', color: theme.muted },
  dotTextOn: { color: theme.paper },
  dotTextDone: { color: theme.accent },
  stepLabel: {
    marginTop: 4,
    fontSize: 9,
    color: theme.muted,
    textAlign: 'center',
  },
  stepLabelActive: { color: theme.ink, fontWeight: '600' },
  hint: { ...monoLabel, color: theme.muted, marginTop: 10, fontSize: 12 },
});
