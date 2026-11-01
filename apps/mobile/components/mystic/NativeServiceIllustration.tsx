import React from 'react';
import { Image, StyleSheet, type ImageStyle } from 'react-native';
import type { ServiceId } from '@template/mystic';
import { NATIVE_SERVICE_CARD_IMAGE } from '../../lib/service-card-images';

type Props = {
  serviceId: ServiceId;
  size?: number;
  /** Wide menu thumb (matches web marketing rows). */
  variant?: 'square' | 'wide';
};

/** Service row photography — same assets as book-flow cards. */
export function NativeServiceIllustration({ serviceId, size = 56, variant = 'square' }: Props) {
  const wideHeight = Math.round(size * 0.62);
  const frameStyle: ImageStyle =
    variant === 'wide'
      ? {
          width: Math.round(size * 1.75),
          height: Math.max(size, wideHeight),
          borderRadius: 10,
        }
      : {
          width: size,
          height: size,
          borderRadius: 10,
        };

  return (
    <Image
      source={NATIVE_SERVICE_CARD_IMAGE[serviceId]}
      style={[styles.photo, frameStyle]}
      resizeMode="cover"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  photo: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
