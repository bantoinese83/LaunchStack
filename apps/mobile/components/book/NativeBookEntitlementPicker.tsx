import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BOOKING_ENTITLEMENT_LABEL,
  BOOK_FLOW_COPY,
  type ClientEntitlement,
} from '@template/mystic';
import { monoLabel, roadTrip, theme } from '@template/mobile-ui';

type Props = {
  value: ClientEntitlement;
  options: ClientEntitlement[];
  onChange: (value: ClientEntitlement) => void;
};

export function NativeBookEntitlementPicker({ value, options, onChange }: Props) {
  if (options.length <= 1) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{BOOK_FLOW_COPY.planForVisit}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[roadTrip.chip, active && roadTrip.chipActive, styles.chip]}
            >
              <Text style={[roadTrip.chipText, active && roadTrip.chipTextActive]}>
                {BOOKING_ENTITLEMENT_LABEL[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 4, gap: 8 },
  label: { ...monoLabel, color: theme.plum, fontSize: 11 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10 },
});
