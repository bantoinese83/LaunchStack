import React from 'react';
import { Platform, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeAccountTabIcon } from '../../../components/navigation/NativeAccountTabIcon';
import { mysticTabBarIcon } from '../../../components/navigation/mysticTabBarIcon';
import { useStudioAccess } from '../../../hooks/useStudioAccess';

function tabIcon(name: string) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) =>
    mysticTabBarIcon(name, focused, color, size);
}

export default function TabsLayout() {
  const isIos = Platform.OS === 'ios';
  const insets = useSafeAreaInsets();
  const { isManager } = useStudioAccess();
  const tabBarHeight = (isIos ? 50 : 54) + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: theme.paper },
        headerStyle: {
          backgroundColor: theme.paper,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.ink,
        headerTitleStyle: {
          fontWeight: isIos ? '600' : '500',
          letterSpacing: isIos ? -0.4 : 0,
          fontSize: 17,
        },
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          backgroundColor: theme.paper,
          borderTopWidth: 2,
          borderTopColor: theme.gold,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, isIos ? 18 : 8),
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          ...monoLabel,
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: theme.muted,
        },
        tabBarActiveTintColor: theme.plum,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: tabIcon('book'),
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visits',
          tabBarIcon: tabIcon('visits'),
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: 'Plans',
          href: isManager ? null : undefined,
          tabBarIcon: tabIcon('membership'),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          href: null,
          tabBarIcon: tabIcon('shop'),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: tabIcon('messages'),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          headerShown: false,
          href: isManager ? undefined : null,
          tabBarIcon: tabIcon('studio'),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profile',
          tabBarIcon: (props) => <NativeAccountTabIcon {...props} />,
        }}
      />
    </Tabs>
  );
}
