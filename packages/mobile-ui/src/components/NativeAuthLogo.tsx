import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

type NativeAuthLogoProps = {
  source: ImageSourcePropType;
  onPress?: () => void;
  style?: StyleProp<ImageStyle>;
};

/** Wordmark lockup for auth screens — pass app-bundled PNG (same as web header). */
export function NativeAuthLogo({ source, onPress, style }: NativeAuthLogoProps) {
  const image = (
    <Image
      source={source}
      style={[styles.logo, style]}
      resizeMode="contain"
      accessibilityLabel="Mystic Hair Co."
    />
  );

  const mark = onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {image}
    </Pressable>
  ) : (
    image
  );

  return <View style={styles.wrap}>{mark}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 240,
    height: 72,
    maxWidth: '88%',
  },
});
