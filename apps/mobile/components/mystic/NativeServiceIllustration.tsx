import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import {
  MYSTIC_SERVICE_ICON_FACE,
  MYSTIC_SERVICE_ICON_FACE_UPDO,
  MYSTIC_SERVICE_ICON_HAIR,
  MYSTIC_SERVICE_ICON_STRANDS,
  MYSTIC_SERVICE_ICON_TONES,
  type ServiceId,
} from '@template/mystic';

function ServiceArt({ serviceId }: { serviceId: ServiceId }) {
  const tone = MYSTIC_SERVICE_ICON_TONES[serviceId];
  const hair = MYSTIC_SERVICE_ICON_HAIR[serviceId];
  const strands = MYSTIC_SERVICE_ICON_STRANDS[serviceId];
  const face = serviceId === 'updo' ? MYSTIC_SERVICE_ICON_FACE_UPDO : MYSTIC_SERVICE_ICON_FACE;

  return (
    <Svg viewBox="0 0 64 64" width="100%" height="100%">
      <Circle cx={32} cy={32} r={30} fill={tone.badge} />
      <Path
        d={hair}
        fill={tone.hair}
        stroke={tone.stroke}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      {strands.map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
      ))}
      <Path
        d={face}
        fill={tone.skin}
        stroke={tone.stroke}
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {serviceId === 'updo' && tone.accent ? (
        <G transform="translate(41 11)">
          <Circle cx={0} cy={0} r={3.4} fill={tone.accent} stroke={tone.stroke} strokeWidth={1.3} />
          <Circle
            cx={-2.4}
            cy={1.8}
            r={2.3}
            fill={tone.accent}
            stroke={tone.stroke}
            strokeWidth={1.1}
          />
          <Circle
            cx={2.4}
            cy={1.8}
            r={2.3}
            fill={tone.accent}
            stroke={tone.stroke}
            strokeWidth={1.1}
          />
          <Circle cx={0} cy={0.5} r={1.15} fill={tone.hair} />
        </G>
      ) : null}
    </Svg>
  );
}

type Props = {
  serviceId: ServiceId;
  size?: number;
};

export function NativeServiceIllustration({ serviceId, size = 56 }: Props) {
  return (
    <View style={[styles.frame, { width: size, height: size }]} accessibilityElementsHidden>
      <ServiceArt serviceId={serviceId} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
});
