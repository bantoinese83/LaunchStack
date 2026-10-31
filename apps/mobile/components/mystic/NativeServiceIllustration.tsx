import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { ServiceId } from '@template/mystic';
import { theme } from '@template/mobile-ui';

const TONE: Record<ServiceId, { stroke: string; fill: string; bg: string }> = {
  blowout: { stroke: theme.accent, fill: theme.gold, bg: theme.goldSoft },
  haircut: { stroke: theme.plum, fill: theme.accent, bg: theme.accentSoft },
  updo: { stroke: theme.plum, fill: theme.gold, bg: theme.goldSoft },
  dry_style: { stroke: theme.accent, fill: theme.chalk, bg: theme.accentSoft },
};

function ServiceArt({
  serviceId,
  stroke,
  fill,
}: {
  serviceId: ServiceId;
  stroke: string;
  fill: string;
}) {
  switch (serviceId) {
    case 'blowout':
      return (
        <Svg viewBox="0 0 64 64" width="100%" height="100%">
          <Path
            d="M12 44c8-14 20-22 32-22 6 0 10 2 12 6"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M10 38c6-8 14-12 24-12s18 4 22 10"
            stroke={fill}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
          <Circle cx={48} cy={18} r={5} stroke={stroke} strokeWidth={1.5} fill="none" />
          <Path d="M48 23v14" stroke={stroke} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M44 30h8" stroke={fill} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'haircut':
      return (
        <Svg viewBox="0 0 64 64" width="100%" height="100%">
          <Path
            d="M22 42 L32 18 L42 42"
            stroke={stroke}
            strokeWidth={2}
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx={32} cy={44} r={3} fill={fill} opacity={0.5} />
          <Path
            d="M18 28c4-6 10-8 14-8M46 28c-4-6-10-8-14-8"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    case 'updo':
      return (
        <Svg viewBox="0 0 64 64" width="100%" height="100%">
          <Ellipse cx={32} cy={28} rx={14} ry={12} stroke={stroke} strokeWidth={1.8} fill="none" />
          <Path
            d="M32 16c-6 4-8 10-8 16 0 8 6 14 14 14"
            stroke={fill}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M38 14l4-4M26 14l-4-4"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={32} cy={40} r={2.5} fill={fill} />
        </Svg>
      );
    case 'dry_style':
      return (
        <Svg viewBox="0 0 64 64" width="100%" height="100%">
          <Path
            d="M14 46c10-8 22-10 34-6"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M28 20c6 8 10 16 10 24"
            stroke={fill}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M36 18c-2 6-2 14 2 22"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
          <Rect
            x={40}
            y={12}
            width={8}
            height={16}
            rx={2}
            stroke={stroke}
            strokeWidth={1.5}
            fill="none"
          />
        </Svg>
      );
    default:
      return null;
  }
}

type Props = {
  serviceId: ServiceId;
  size?: number;
};

export function NativeServiceIllustration({ serviceId, size = 52 }: Props) {
  const tone = TONE[serviceId];
  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          backgroundColor: tone.bg,
          borderColor: theme.line,
        },
      ]}
      accessibilityElementsHidden
    >
      <View style={styles.pad}>
        <ServiceArt serviceId={serviceId} stroke={tone.stroke} fill={tone.fill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pad: {
    flex: 1,
    padding: 8,
  },
});
