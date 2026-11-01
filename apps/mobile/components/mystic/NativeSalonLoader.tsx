import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { MYSTIC_LOADING_COPY, type MysticLoadingCopyKey } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeFlowerField } from './NativeFlowerField';

type Props = {
  label?: string;
  copyKey?: MysticLoadingCopyKey;
  hideLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fill?: boolean;
  style?: ViewStyle;
};

const ringPx = { sm: 44, md: 56, lg: 68 } as const;
const iconPx = { sm: 18, md: 22, lg: 26 } as const;

function ScissorsIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="6" r="3" stroke={color} strokeWidth={1.75} />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={1.75} />
      <Path
        d="M8.12 8.12 20 20"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.12 15.88 20 4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ScissorsSpinner({ size }: { size: keyof typeof ringPx }) {
  const box = ringPx[size];
  const icon = iconPx[size];
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: 'center', justifyContent: 'center', transform: [{ rotate }] },
        ]}
      >
        <Svg width={box} height={box} viewBox="0 0 48 48">
          <Circle cx="24" cy="24" r="20" fill="none" stroke={theme.line} strokeWidth="3" />
          <Circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke={theme.accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="38 88"
          />
        </Svg>
      </Animated.View>
      <ScissorsIcon size={icon} color={theme.ink} />
    </View>
  );
}

export function NativeSalonLoader({
  label,
  copyKey,
  hideLabel = false,
  size = 'md',
  fill = false,
  style,
}: Props) {
  const caption = label ?? (copyKey ? MYSTIC_LOADING_COPY[copyKey] : MYSTIC_LOADING_COPY.default);

  const content = (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={caption}
      accessibilityState={{ busy: true }}
    >
      <ScissorsSpinner size={size} />
      {!hideLabel ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );

  if (fill) {
    return (
      <View style={styles.fill}>
        <NativeFlowerField mode="launch" count={20} opacity={0.42} showGradient={false} />
        <View style={styles.fillForeground}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 200,
    backgroundColor: theme.paper,
    overflow: 'hidden',
  },
  fillForeground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  wrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  caption: {
    ...monoLabel,
    fontSize: 11,
    letterSpacing: 1.4,
    color: theme.muted,
    textAlign: 'center',
    maxWidth: 220,
    textTransform: 'none',
    fontWeight: '500',
  },
});
