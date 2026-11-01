import React, { type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { hapticSelect } from '../../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Skip soft haptic (e.g. dense lists). */
  skipHaptic?: boolean;
  minScale?: number;
};

/** Spring scale press — Expo Go safe (Reanimated + RN Pressable). */
export function NativePressableScale({
  children,
  style,
  skipHaptic = false,
  minScale = 0.97,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPressIn={(e: GestureResponderEvent) => {
        scale.value = withSpring(minScale, { damping: 22, stiffness: 320, mass: 0.35 });
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.value = withSpring(1, { damping: 22, stiffness: 320, mass: 0.35 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (!skipHaptic && !disabled) hapticSelect();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
