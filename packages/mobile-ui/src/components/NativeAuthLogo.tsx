import React from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
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

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap} accessibilityRole="button">
        {image}
      </Pressable>
    );
  }

  return image;
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  logo: {
    width: 240,
    height: 48,
    maxWidth: '100%',
  },
});
