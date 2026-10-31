import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { nativeBtn3dStyles } from '../nativeBtn3d';
import { theme } from '../theme';

export interface NativeButtonProps extends Omit<
  React.ComponentProps<typeof Pressable>,
  'children' | 'style'
> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  style?: ViewStyle;
}

export const NativeButton: React.FC<NativeButtonProps> = ({
  title,
  variant = 'primary',
  isLoading,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = Boolean(disabled || isLoading);
  const spinnerColor = variant === 'primary' || variant === 'danger' ? theme.paper : theme.ink;

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(isLoading) }}
      accessibilityLabel={isLoading ? `${title}, loading` : title}
      style={style}
      {...props}
    >
      {({ pressed }) => {
        const { wrap, lip, face, label } = nativeBtn3dStyles(
          variant,
          pressed && !isDisabled,
          isDisabled
        );
        return (
          <View style={[wrap, isDisabled && styles.disabled]}>
            <View style={lip} pointerEvents="none" />
            <View style={face}>
              {isLoading ? (
                <ActivityIndicator color={spinnerColor} />
              ) : (
                <Text style={label}>{title}</Text>
              )}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
});
