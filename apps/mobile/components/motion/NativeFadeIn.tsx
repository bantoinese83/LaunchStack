import React, { type ComponentProps, type ReactNode } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Slight rise + fade (lists / empty states). Default: fade only. */
  rise?: boolean;
  delayMs?: number;
} & Pick<ComponentProps<typeof Animated.View>, 'accessibilityRole' | 'accessibilityLabel'>;

/** Subtle enter — keep duration short so it never feels showy. */
export function NativeFadeIn({
  children,
  style,
  rise = false,
  delayMs = 0,
  accessibilityRole,
  accessibilityLabel,
}: Props) {
  const entering = rise
    ? FadeInDown.duration(260).delay(delayMs)
    : FadeIn.duration(200).delay(delayMs);

  return (
    <Animated.View
      entering={entering}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Animated.View>
  );
}
