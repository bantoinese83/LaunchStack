import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { monoLabel, theme } from '@template/mobile-ui';

type Props = {
  value: string;
  onChange: (isoDate: string) => void;
  days?: number;
};

function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Horizontal day strip — parity with web MysticBookDateStrip. */
export function NativeBookDateStrip({ value, onChange, days = 14 }: Props) {
  const slots = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => addDays(start, i));
  }, [days]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {slots.map((d) => {
        const iso = toIso(d);
        const active = value === iso;
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        return (
          <Pressable
            key={iso}
            disabled={isWeekend}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: isWeekend }}
            accessibilityLabel={d.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            onPress={() => onChange(iso)}
            style={[styles.chip, active && styles.chipActive, isWeekend && styles.chipDisabled]}
          >
            <Text style={[styles.weekday, active && styles.chipTextActive]}>
              {d.toLocaleDateString(undefined, { weekday: 'short' })}
            </Text>
            <Text style={[styles.dayNum, active && styles.chipTextActive]}>{d.getDate()}</Text>
            <Text style={[styles.month, active && styles.chipTextMutedActive]}>
              {d.toLocaleDateString(undefined, { month: 'short' })}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    width: 68,
    alignItems: 'center',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  chipActive: {
    borderColor: theme.shell,
    backgroundColor: theme.shell,
  },
  chipDisabled: { opacity: 0.4 },
  weekday: { ...monoLabel, fontSize: 10, color: theme.muted },
  dayNum: { fontSize: 18, fontWeight: '600', color: theme.ink, marginTop: 4 },
  month: { fontSize: 10, color: theme.muted, marginTop: 2 },
  chipTextActive: { color: theme.paper },
  chipTextMutedActive: { color: 'rgba(255,255,255,0.75)' },
});
