import React from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import stripeWordmark from '../../assets/brand/stripe-wordmark.png';

/** Match web — square padded asset needs a larger box. */
export const NATIVE_STRIPE_WORDMARK_SIZE = {
  inline: 40,
  footnote: 48,
  button: 56,
} as const;

type Props = {
  size?: number;
  style?: ImageStyle;
};

export function NativeStripeWordmark({ size = NATIVE_STRIPE_WORDMARK_SIZE.inline, style }: Props) {
  return (
    <Image
      source={stripeWordmark}
      accessibilityLabel="Stripe"
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

export function NativePayWithStripeLabel({
  logoSize = NATIVE_STRIPE_WORDMARK_SIZE.button,
  textStyle,
  style,
}: {
  logoSize?: number;
  textStyle?: React.ComponentProps<typeof Text>['style'];
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.row, style]} importantForAccessibility="no-hide-descendants">
      <Text style={textStyle}>Pay with </Text>
      <NativeStripeWordmark size={logoSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
