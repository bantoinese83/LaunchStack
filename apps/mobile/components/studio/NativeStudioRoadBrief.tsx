import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { StudioRoadBrief } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeFadeIn } from '../motion/NativeFadeIn';
import { NativePressableScale } from '../motion/NativePressableScale';

type Props = {
  brief: StudioRoadBrief;
};

/**
 * Studio hero — road-atlas poster: horizon wash, coined metric, one insight, tools as map legend.
 */
export function NativeStudioRoadBrief({ brief }: Props) {
  const router = useRouter();
  const isClear =
    brief.liveCount === 0 && brief.stopsToday === 0 && brief.stopsComingUp === 0 && !brief.nextStop;
  const heroNumber =
    brief.liveCount > 0 ? brief.liveCount : brief.stopsToday > 0 ? brief.stopsToday : null;

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
    <NativeFadeIn
      rise
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel={`${brief.metricLabel}. ${brief.insight}`}
    >
      <View style={styles.poster}>
        <LinearGradient
          colors={['#242B20', theme.shell, '#121510']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Horizon wash */}
        <LinearGradient
          colors={['transparent', 'rgba(196,169,98,0.12)', 'transparent']}
          start={{ x: 0, y: 0.35 }}
          end={{ x: 1, y: 0.65 }}
          style={styles.horizon}
          pointerEvents="none"
        />
        {/* Soft vignette corner */}
        <View style={styles.vignette} pointerEvents="none" />

        <View style={styles.posterInner}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>Road day</Text>
            <View style={styles.mileMark}>
              <View style={styles.mileDot} />
              <Text style={styles.mileText}>CHI</Text>
            </View>
          </View>

          {isClear ? (
            <View style={styles.clearHero}>
              <View style={styles.clearRule} />
              <Text style={styles.clearTitle}>{brief.metricLabel}</Text>
              <Text style={styles.clearSub}>Open road · next 7 days</Text>
            </View>
          ) : (
            <View style={styles.metricRow}>
              <Text style={styles.metricNumber}>{heroNumber}</Text>
              <View style={styles.metricCopy}>
                <Text style={styles.metricLabel}>{brief.metricLabel}</Text>
                {brief.stopsComingUp > 0 ? (
                  <Text style={styles.metricSub}>{brief.stopsComingUp} coming up this week</Text>
                ) : (
                  <Text style={styles.metricSub}>On today’s route</Text>
                )}
              </View>
            </View>
          )}

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
      </View>

      <View style={styles.toolsBlock}>
        <View style={styles.toolsHeader}>
          <Text style={styles.toolsKicker}>Atlas</Text>
          <View style={styles.toolsHair} />
        </View>
        <View style={styles.toolGrid}>
          <ToolTile
            label="Calendar"
            hint="Week & blocks"
            delay={0}
            onPress={() => router.push('/(app)/(tabs)/studio/calendar')}
          />
          <ToolTile
            label="Clients"
            hint="Roster & threads"
            delay={40}
            onPress={() => router.push('/(app)/(tabs)/studio/clients')}
          />
          <ToolTile
            label="Blasts"
            hint="SMS & email"
            delay={80}
            onPress={() => router.push('/(app)/(tabs)/studio/blasts')}
          />
          <ToolTile
            label="More"
            hint="Month, pricing"
            delay={120}
            onPress={() => router.push('/(app)/(tabs)/studio/more')}
          />
        </View>
      </View>
    </NativeFadeIn>
  );
}

function ToolTile({
  label,
  hint,
  onPress,
  delay,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  delay: number;
}) {
  return (
    <NativeFadeIn delayMs={delay} style={styles.tileWrap}>
      <NativePressableScale onPress={onPress} style={styles.tile} accessibilityRole="button">
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileHint}>{hint}</Text>
        <Text style={styles.tileArrow}>→</Text>
      </NativePressableScale>
    </NativeFadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 26 },
  poster: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    minHeight: 220,
  },
  horizon: {
    ...StyleSheet.absoluteFill,
  },
  vignette: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(196,169,98,0.08)',
  },
  posterInner: {
    padding: 22,
    paddingBottom: 24,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    ...monoLabel,
    color: theme.gold,
    fontSize: 10,
  },
  mileMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mileDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.gold,
  },
  mileText: {
    ...monoLabel,
    color: 'rgba(247,244,237,0.45)',
    fontSize: 9,
    letterSpacing: 2,
  },
  clearHero: {
    marginTop: 28,
    gap: 10,
  },
  clearRule: {
    width: 48,
    height: 2,
    backgroundColor: theme.gold,
    borderRadius: 1,
  },
  clearTitle: {
    fontSize: 40,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -1.4,
    lineHeight: 42,
  },
  clearSub: {
    fontSize: 13,
    letterSpacing: 0.2,
    color: 'rgba(247,244,237,0.48)',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    marginTop: 22,
  },
  metricNumber: {
    fontSize: 72,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -3,
    lineHeight: 70,
  },
  metricCopy: { flex: 1, paddingBottom: 8 },
  metricLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -0.5,
  },
  metricSub: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(247,244,237,0.55)',
  },
  insight: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(247,244,237,0.16)',
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(247,244,237,0.9)',
  },
  nextCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(247,244,237,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,169,98,0.4)',
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
  cta: { marginTop: 18 },
  toolsBlock: { gap: 12 },
  toolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolsKicker: {
    ...monoLabel,
    color: theme.plum,
    fontSize: 10,
  },
  toolsHair: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.line,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tileWrap: {
    width: '47.5%',
    flexGrow: 1,
    minWidth: '45%',
  },
  tile: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    minHeight: 88,
  },
  tileLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.ink,
    letterSpacing: -0.3,
  },
  tileHint: {
    marginTop: 5,
    fontSize: 12,
    color: theme.muted,
    lineHeight: 16,
  },
  tileArrow: {
    marginTop: 12,
    fontSize: 16,
    color: theme.gold,
    fontWeight: '500',
  },
});
