import React from 'react';
import { StyleSheet, Text, type ViewStyle } from 'react-native';
import { handAccent, roadTrip } from '@template/mobile-ui';
import { NativeFadeIn } from '../motion/NativeFadeIn';

type Props = {
  kicker: string;
  title: string;
  lede?: string;
  style?: ViewStyle;
};

export function NativeScreenHeader({ kicker, title, lede, style }: Props) {
  return (
    <NativeFadeIn style={[styles.wrap, style]}>
      <Text style={handAccent}>{kicker}</Text>
      <Text style={roadTrip.title}>{title}</Text>
      {lede ? <Text style={roadTrip.lede}>{lede}</Text> : null}
    </NativeFadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, width: '100%' },
});
