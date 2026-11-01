import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { buildMobileFlowerField, type MobileFlowerSeed } from '../../lib/heroFlowers';
import { theme } from '@template/mobile-ui';

type Mode = 'launch' | 'idle';

type Props = {
  mode?: Mode;
  count?: number;
  opacity?: number;
  showGradient?: boolean;
  style?: ViewStyle;
};

const BloomFlower = memo(function BloomFlower({
  flower,
  mode,
}: {
  flower: MobileFlowerSeed;
  mode: Mode;
}) {
  const bloom = useSharedValue(0);

  useEffect(() => {
    const openMs = mode === 'launch' ? 3600 : 2800;
    const open = withTiming(1, {
      duration: openMs,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    if (mode === 'idle') {
      bloom.value = withDelay(
        flower.bloomDelayMs,
        withSequence(
          open,
          withRepeat(
            withSequence(
              withTiming(1.05, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
              withTiming(0.94, { duration: 2600, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
          )
        )
      );
      return;
    }
    bloom.value = withDelay(flower.bloomDelayMs, open);
  }, [bloom, flower.bloomDelayMs, mode]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = Math.min(bloom.value, 1);
    return {
      transform: [{ scale: 0.08 + t * 0.92 }],
      opacity: 0.12 + t * 0.8,
    };
  });

  const { size, petals, petalColor, centerColor } = flower;
  const half = size / 2;

  return (
    <Animated.View
      style={[
        styles.flowerSlot,
        {
          left: flower.x - half,
          top: flower.y - half,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: petals }, (_, i) => {
          const angle = (360 / petals) * i;
          return (
            <G key={i} rotation={angle} origin={`${half}, ${half}`}>
              <Ellipse
                cx={half}
                cy={half - size * 0.22}
                rx={size * 0.11}
                ry={size * 0.26}
                fill={petalColor}
                opacity={0.92}
              />
            </G>
          );
        })}
        <Circle cx={half} cy={half} r={size * 0.11} fill={centerColor} />
      </Svg>
    </Animated.View>
  );
});

/** Staggered SVG blooms — lightweight stand-in for web canvas hero field. */
export function NativeFlowerField({
  mode = 'idle',
  count = 28,
  opacity = 0.55,
  showGradient = true,
  style,
}: Props) {
  const { width, height } = useWindowDimensions();
  const flowers = useMemo(
    () =>
      buildMobileFlowerField(width, height * 1.05, count, {
        maxBloomDelayMs: 1400,
        staggerMs: 28,
      }),
    [width, height, count]
  );

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }, style]} pointerEvents="none">
      {showGradient ? (
        <LinearGradient
          colors={[theme.paper, '#f3efe4', `${theme.accent}33`]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.paper }]} />
      )}
      {flowers.map((flower) => (
        <BloomFlower key={flower.id} flower={flower} mode={mode} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flowerSlot: {
    position: 'absolute',
  },
});
