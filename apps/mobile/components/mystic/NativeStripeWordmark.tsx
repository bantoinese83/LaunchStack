import React from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import stripeWordmark from '../../assets/brand/stripe-wordmark.png';

type Props = {
  height?: number;
  style?: ImageStyle;
};

export function NativeStripeWordmark({ height = 14, style }: Props) {
  const width = Math.round(height * 2.55);
  return (
    <Image
      source={stripeWordmark}
      accessibilityLabel="Stripe"
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}

export function NativePayWithStripeLabel({
  logoHeight = 15,
  textStyle,
  style,
}: {
  logoHeight?: number;
  textStyle?: React.ComponentProps<typeof Text>['style'];
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.row, style]} importantForAccessibility="no-hide-descendants">
      <Text style={textStyle}>Pay with </Text>
      <NativeStripeWordmark height={logoHeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
