import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { theme } from '@template/mobile-ui';

type Props = {
  url?: string | null;
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
};

export function NativeUserAvatar({ url, source, name, size = 32 }: Props) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  if (source) {
    return (
      <Image
        source={source}
        style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: Math.max(11, size * 0.38) }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.accentSoft,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.accentSoft,
  },
  initial: {
    fontWeight: '600',
    color: theme.accent,
  },
});
