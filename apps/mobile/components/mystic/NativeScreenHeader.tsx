import React from 'react';
import { StyleSheet, Text, type ViewStyle } from 'react-native';
import { handAccent, roadTrip } from '@template/mobile-ui';
import { NativeRoadStripe } from './NativeRoadStripe';
import { NativeFadeIn } from '../motion/NativeFadeIn';

type Props = {
  kicker: string;
  title: string;
  lede?: string;
  style?: ViewStyle;
  /** Hide the gold/plum/sage stripe (rare). */
  hideStripe?: boolean;
};

export function NativeScreenHeader({ kicker, title, lede, style, hideStripe = false }: Props) {
  return (
    <NativeFadeIn style={[styles.wrap, style]}>
      {!hideStripe ? <NativeRoadStripe compact /> : null}
      <Text style={handAccent}>{kicker}</Text>
      <Text style={roadTrip.title}>{title}</Text>
      {lede ? <Text style={roadTrip.lede}>{lede}</Text> : null}
    </NativeFadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, width: '100%' },
});
