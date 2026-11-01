import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const STEP_ICON: Record<
  BookingFlowStep,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  service: 'content-cut',
  datetime: 'calendar-clock',
  location: 'map-marker',
  details: 'clipboard-text-outline',
  review: 'credit-card-outline',
};

export function NativeBookStepProgress({ step, onStepChange }: Props) {
  const currentIndex = bookingFlowStepIndex(step);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: BOOKING_FLOW_STEPS.length, now: currentIndex + 1 }}
    >
      <View style={styles.steps}>
        {BOOKING_FLOW_STEPS.map((id, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = onStepChange && canNavigateToBookingStep(step, id);
          const iconName = done ? 'check' : STEP_ICON[id];
          const iconColor = active ? theme.paper : done ? theme.accent : theme.muted;
          const dot = (
            <View
              style={[styles.dot, active && styles.dotActive, done && !active && styles.dotDone]}
            >
              <MaterialCommunityIcons name={iconName} size={16} color={iconColor} />
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
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  stepCol: { flex: 1, alignItems: 'center', minWidth: 0 },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: theme.accent },
  dotDone: { backgroundColor: theme.accentSoft },
  stepLabel: {
    marginTop: 4,
    fontSize: 9,
    color: theme.muted,
    textAlign: 'center',
  },
  stepLabelActive: { color: theme.ink, fontWeight: '600' },
  hint: { ...monoLabel, color: theme.plum, marginTop: 10, fontSize: 12 },
});
