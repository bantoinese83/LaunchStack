import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { nativeBtn3dStyles } from '../nativeBtn3d';
import { theme } from '../theme';

export interface NativeButtonProps extends Omit<
  React.ComponentProps<typeof Pressable>,
  'children' | 'style'
> {
  title: string;
  /** Visual label; `title` remains the default accessibility label. */
  content?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  style?: ViewStyle;
}

export const NativeButton: React.FC<NativeButtonProps> = ({
  title,
  content,
  variant = 'primary',
  isLoading,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const isDisabled = Boolean(disabled || isLoading);
  const spinnerColor = variant === 'primary' || variant === 'danger' ? theme.paper : theme.ink;
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(to: number) {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      friction: 7,
      tension: 220,
    }).start();
  }

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(isLoading) }}
      accessibilityLabel={isLoading ? `${title}, loading` : title}
      style={style}
      onPressIn={(e) => {
        if (!isDisabled) animateTo(0.97);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      {...props}
    >
      {({ pressed }) => {
        const { wrap, lip, face, label } = nativeBtn3dStyles(
          variant,
          pressed && !isDisabled,
          isDisabled
        );
        return (
          <Animated.View style={{ transform: [{ scale }] }}>
            <View style={[wrap, isDisabled && styles.disabled]}>
              <View style={lip} pointerEvents="none" />
              <View style={face}>
                {isLoading ? (
                  <ActivityIndicator color={spinnerColor} />
                ) : content ? (
                  <View style={styles.content}>{content}</View>
                ) : (
                  <Text style={label}>{title}</Text>
                )}
              </View>
            </View>
          </Animated.View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
