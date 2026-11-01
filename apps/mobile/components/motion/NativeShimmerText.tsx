import React, { useEffect } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@template/mobile-ui';

type Props = {
  children: string;
  style?: TextStyle;
};

/** Soft pulse on loading copy — calmer than a spinner for short waits. */
export function NativeShimmerText({ children, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.38, 1]),
  }));

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]} accessibilityRole="text">
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.muted,
    textAlign: 'center',
  },
});
