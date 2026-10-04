import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { monoLabel, theme } from '@template/mobile-ui';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: { fontWeight: '500', letterSpacing: -0.4, fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.shell,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: Platform.OS === 'ios' ? 84 : 62,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...monoLabel,
          fontSize: 9,
          letterSpacing: 1.2,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Overview' }} />
      <Tabs.Screen name="feedback" options={{ title: 'Feedback' }} />
    </Tabs>
  );
}
