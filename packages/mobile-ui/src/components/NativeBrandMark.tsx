import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { theme } from '../theme';
import { LAUNCHSTACK_MARK_VIEWBOX, launchstackMarkPaths } from '../launchstackMarkPaths';

export type NativeBrandMarkProps = {
  size?: number;
  color?: string;
};

export const NativeBrandMark: React.FC<NativeBrandMarkProps> = ({
  size = 44,
  color = theme.shell,
}) => (
  <View
    style={[
      styles.wrap,
      {
        width: size,
        height: size,
      },
    ]}
  >
    <Svg
      width={size}
      height={size}
      viewBox={LAUNCHSTACK_MARK_VIEWBOX}
      accessibilityLabel="LaunchStack"
    >
      <G fill={color}>
        {launchstackMarkPaths.map((d, index) => (
          <Path key={index} d={d} />
        ))}
      </G>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    ...Platform.select({
      ios: {
        shadowColor: theme.shell,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
});
