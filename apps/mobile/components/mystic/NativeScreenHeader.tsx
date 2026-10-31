import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { roadTrip } from '@template/mobile-ui';

type Props = {
  kicker: string;
  title: string;
  lede?: string;
  style?: ViewStyle;
};

export function NativeScreenHeader({ kicker, title, lede, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={roadTrip.kicker}>{kicker}</Text>
      <Text style={roadTrip.title}>{title}</Text>
      {lede ? <Text style={roadTrip.lede}>{lede}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8, width: '100%' },
});
