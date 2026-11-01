import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BOOKING_FLOW_STEPS,
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

/** Compact Book › Service › … trail — scrolls on narrow phones. */
export function NativeBookStepBreadcrumb({ step, onStepChange }: Props) {
  const currentIndex = bookingFlowStepIndex(step);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel="Booking steps"
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      <Text style={styles.crumb} accessibilityRole="text">
        Book
      </Text>
      {BOOKING_FLOW_STEPS.map((id, index) => {
        const label = BOOKING_FLOW_STEP_LABEL[id];
        const isCurrent = index === currentIndex;
        const reachable = Boolean(onStepChange && canNavigateToBookingStep(step, id));
        return (
          <View key={id} style={styles.segment}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={theme.line}
              accessibilityElementsHidden
            />
            {isCurrent ? (
              <Text style={styles.crumbCurrent} accessibilityState={{ selected: true }}>
                {label}
              </Text>
            ) : reachable ? (
              <Pressable
                onPress={() => onStepChange?.(id)}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${label}`}
                hitSlop={6}
              >
                <Text style={styles.crumbLink}>{label}</Text>
              </Pressable>
            ) : (
              <Text style={styles.crumbMuted}>{label}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 12, flexGrow: 0 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  crumb: {
    ...monoLabel,
    fontSize: 11,
    color: theme.muted,
    fontWeight: '600',
  },
  crumbLink: {
    ...monoLabel,
    fontSize: 11,
    color: theme.muted,
    textDecorationLine: 'underline',
  },
  crumbMuted: {
    ...monoLabel,
    fontSize: 11,
    color: theme.line,
  },
  crumbCurrent: {
    ...monoLabel,
    fontSize: 11,
    color: theme.ink,
    fontWeight: '600',
  },
});
