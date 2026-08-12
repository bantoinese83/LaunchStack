import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@template/mobile-ui';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: { fontWeight: '700', letterSpacing: -0.3 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.line,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
    </Tabs>
  );
}
