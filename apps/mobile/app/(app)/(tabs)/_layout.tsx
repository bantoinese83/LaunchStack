import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { monoLabel, theme } from '@template/mobile-ui';

export default function TabsLayout() {
  const isIos = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: {
          fontWeight: isIos ? '600' : '500',
          letterSpacing: isIos ? -0.4 : 0,
          fontSize: 17,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: isIos ? theme.shell : theme.surface,
          borderTopColor: isIos ? 'rgba(255,255,255,0.08)' : theme.line,
          height: isIos ? 84 : 64,
          paddingBottom: isIos ? 24 : 10,
          paddingTop: 8,
          elevation: isIos ? 0 : 8,
        },
        tabBarLabelStyle: {
          ...monoLabel,
          fontSize: isIos ? 10 : 11,
          letterSpacing: isIos ? 1.2 : 0.5,
          textTransform: isIos ? 'uppercase' : 'none',
        },
        tabBarActiveTintColor: isIos ? theme.gold : theme.accent,
        tabBarInactiveTintColor: isIos ? 'rgba(255,255,255,0.45)' : theme.muted,
      }}
    >
      <Tabs.Screen name="book" options={{ title: 'Book' }} />
      <Tabs.Screen name="visits" options={{ title: 'Visits' }} />
      <Tabs.Screen name="membership" options={{ title: 'Plans' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
