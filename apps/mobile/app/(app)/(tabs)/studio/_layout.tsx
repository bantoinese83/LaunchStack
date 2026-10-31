import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';

export default function StudioStackLayout() {
  const { isManager, loading } = useStudioAccess();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.paper,
        }}
      >
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!isManager) {
    return <Redirect href="/(app)/(tabs)/book" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.paper },
        headerTintColor: theme.ink,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Studio' }} />
      <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Stack.Screen name="clients" options={{ title: 'Clients' }} />
      <Stack.Screen name="thread/[clientUserId]" options={{ title: 'Message' }} />
      <Stack.Screen name="more" options={{ title: 'More' }} />
      <Stack.Screen name="settings" options={{ title: 'Pricing & deposits' }} />
      <Stack.Screen name="blocked" options={{ title: 'Blocked dates' }} />
      <Stack.Screen name="referrals" options={{ title: 'Referrals' }} />
      <Stack.Screen name="blasts" options={{ title: 'Blasts' }} />
    </Stack>
  );
}
