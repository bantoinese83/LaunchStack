import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@template/mobile-ui';
import { MysticTabBar } from '../../../components/navigation/MysticTabBar';
import { useStudioAccess } from '../../../hooks/useStudioAccess';

/**
 * Bottom nav = top-level destinations only (3–5 tabs).
 * Clients: Book · Visits · Inbox · You
 * Studio managers: + Studio (Plans/Shop live under You, not the tab bar)
 */
export default function TabsLayout() {
  const { isManager } = useStudioAccess();

  return (
    <Tabs
      tabBar={(props) => <MysticTabBar {...(props as Parameters<typeof MysticTabBar>[0])} />}
      screenOptions={{
        sceneStyle: { backgroundColor: theme.paper },
        headerStyle: {
          backgroundColor: theme.paper,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.ink,
        headerTitleStyle: {
          fontWeight: '600',
          letterSpacing: -0.3,
          fontSize: 17,
        },
        headerShadowVisible: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: theme.plum,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tabs.Screen name="book" options={{ title: 'Book' }} />
      <Tabs.Screen name="visits" options={{ title: 'Visits' }} />
      <Tabs.Screen
        name="membership"
        options={{
          title: 'Plans',
          href: null,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          href: null,
        }}
      />
      <Tabs.Screen name="messages" options={{ title: 'Inbox' }} />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          headerShown: false,
          href: isManager ? undefined : null,
        }}
      />
      <Tabs.Screen name="account" options={{ title: 'You' }} />
    </Tabs>
  );
}
