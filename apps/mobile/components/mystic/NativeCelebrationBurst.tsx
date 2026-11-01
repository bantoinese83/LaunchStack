import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '@template/mobile-ui';

const COLORS = [theme.gold, theme.plum, theme.accent, theme.chalk, '#E8D4A8', '#9BB890'] as const;
const PARTICLE_COUNT = 48;

type Particle = {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  drift: number;
};

function ParticleView({ p }: { p: Particle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      p.delay,
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) })
    );
  }, [p.delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: progress.value * (Dimensions.get('window').height * 0.55) },
      { translateX: progress.value * p.drift },
      { rotate: `${progress.value * 360}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: p.left,
          width: p.size,
          height: p.size * 0.65,
          backgroundColor: p.color,
          borderRadius: p.size > 8 ? 2 : 999,
        },
        style,
      ]}
    />
  );
}

/** One-shot confetti burst for booking / plan success. */
export function NativeCelebrationBurst({
  fire,
  burstKey = 0,
}: {
  fire: boolean;
  burstKey?: number;
}) {
  const particles = useMemo<Particle[]>(() => {
    const width = Dimensions.get('window').width;
    return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
      id,
      left: Math.random() * width,
      size: 6 + Math.random() * 8,
      color: COLORS[id % COLORS.length]!,
      delay: Math.random() * 400,
      drift: (Math.random() - 0.5) * 80,
    }));
  }, [burstKey]);

  useEffect(() => {
    if (!fire) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [fire]);

  if (!fire) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      {particles.map((p) => (
        <ParticleView key={`${burstKey}-${p.id}`} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: -16,
  },
});
