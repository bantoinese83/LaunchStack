import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { StudioRoadBrief } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';

type Props = {
  brief: StudioRoadBrief;
};

/**
 * Studio hero — coined “stops / clear road” metric + one insight + one action.
 * Navigation chips cover Calendar / Clients / Blasts / More (settings live under More).
 */
export function NativeStudioRoadBrief({ brief }: Props) {
  const router = useRouter();
  const heroNumber =
    brief.liveCount > 0 ? brief.liveCount : brief.stopsToday > 0 ? brief.stopsToday : 0;

  /** When stops are listed below, don’t repeat “up next” or push calendar again. */
  const showNextCard = Boolean(brief.nextStop) && brief.stopsToday === 0;
  const showCta = brief.primaryAction === 'calendar' || brief.primaryAction === 'blocked';

  function runPrimary() {
    if (brief.primaryAction === 'blocked') {
      router.push('/(app)/(tabs)/studio/blocked');
      return;
    }
    router.push('/(app)/(tabs)/studio/calendar');
  }

  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel={`${brief.metricLabel}. ${brief.insight}`}
    >
      <View style={styles.poster}>
        <Text style={styles.eyebrow}>Road day</Text>

        <View style={styles.metricRow}>
          <Text style={styles.metricNumber}>{heroNumber}</Text>
          <View style={styles.metricCopy}>
            <Text style={styles.metricLabel}>{brief.metricLabel}</Text>
            {brief.stopsComingUp > 0 ? (
              <Text style={styles.metricSub}>{brief.stopsComingUp} coming up this week</Text>
            ) : (
              <Text style={styles.metricSub}>Next 7 days</Text>
            )}
          </View>
        </View>

        <Text style={styles.insight}>{brief.insight}</Text>

        {showNextCard && brief.nextStop ? (
          <View style={styles.nextCard}>
            <Text style={styles.nextEyebrow}>{brief.nextStop.live ? 'Live now' : 'Up next'}</Text>
            <Text style={styles.nextService}>{brief.nextStop.serviceName}</Text>
            <Text style={styles.nextWhen}>{brief.nextStop.whenLabel}</Text>
          </View>
        ) : null}

        {showCta ? (
          <NativeButton
            title={brief.primaryLabel}
            variant="secondary"
            onPress={runPrimary}
            style={styles.cta}
          />
        ) : null}
      </View>

      <View style={styles.toolStrip}>
        <ToolChip label="Calendar" onPress={() => router.push('/(app)/(tabs)/studio/calendar')} />
        <ToolChip label="Clients" onPress={() => router.push('/(app)/(tabs)/studio/clients')} />
        <ToolChip label="Blasts" onPress={() => router.push('/(app)/(tabs)/studio/blasts')} />
        <ToolChip label="More" onPress={() => router.push('/(app)/(tabs)/studio/more')} />
      </View>
    </View>
  );
}

function ToolChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      accessibilityRole="button"
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  poster: {
    backgroundColor: theme.shell,
    borderRadius: theme.radii.xl,
    padding: 18,
    overflow: 'hidden',
  },
  eyebrow: {
    ...monoLabel,
    color: theme.gold,
    fontSize: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    marginTop: 18,
  },
  metricNumber: {
    fontSize: 64,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -2.5,
    lineHeight: 64,
  },
  metricCopy: { flex: 1, paddingBottom: 6 },
  metricLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -0.4,
  },
  metricSub: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(247,244,237,0.55)',
  },
  insight: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(247,244,237,0.18)',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(247,244,237,0.88)',
  },
  nextCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(247,244,237,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,169,98,0.35)',
  },
  nextEyebrow: {
    ...monoLabel,
    color: theme.gold,
    fontSize: 9,
    marginBottom: 6,
  },
  nextService: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.paper,
  },
  nextWhen: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(247,244,237,0.6)',
  },
  cta: { marginTop: 16 },
  toolStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  chipPressed: {
    backgroundColor: theme.goldSoft,
    borderColor: theme.gold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
  },
});
