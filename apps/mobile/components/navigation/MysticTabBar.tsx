import React from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@template/mobile-ui';
import { NativePressableScale } from '../motion/NativePressableScale';
import { NativeAccountTabIcon } from './NativeAccountTabIcon';
import { mysticTabBarIcon } from './mysticTabBarIcon';

const ICON_SIZE = 22;
const HIT = 48;

function isHiddenTab(tabBarItemStyle: StyleProp<ViewStyle> | undefined) {
  const flat = StyleSheet.flatten(tabBarItemStyle);
  return flat?.display === 'none';
}

/** Custom tab bar — road-trip bar: paper deck, gold pinstripe, mileage tick on active. */
export function MysticTabBar(props: {
  state: { index: number; routes: { key: string; name: string; params?: object }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: unknown;
        tabBarAccessibilityLabel?: string;
        tabBarItemStyle?: StyleProp<ViewStyle>;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target?: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  return (
    <View style={[styles.shell, { paddingBottom: bottomPad }]} accessibilityRole="tablist">
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          if (isHiddenTab(options.tabBarItemStyle)) return null;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const color = focused ? theme.ink : theme.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const icon =
            route.name === 'account' ? (
              <NativeAccountTabIcon focused={focused} color={color} size={ICON_SIZE} />
            ) : (
              mysticTabBarIcon(route.name, focused, color, ICON_SIZE)
            );

          return (
            <NativePressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
              minScale={0.94}
            >
              <View style={[styles.iconWell, focused && styles.iconWellOn]}>{icon}</View>
              <Text
                style={[styles.label, focused ? styles.labelOn : styles.labelOff]}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {label}
              </Text>
            </NativePressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: theme.paper,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    minHeight: HIT,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: HIT,
    paddingHorizontal: 2,
    gap: 2,
  },
  iconWell: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconWellOn: {
    backgroundColor: theme.goldSoft,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelOn: {
    color: theme.ink,
    fontWeight: '700',
  },
  labelOff: {
    color: theme.muted,
    fontWeight: '500',
  },
});
