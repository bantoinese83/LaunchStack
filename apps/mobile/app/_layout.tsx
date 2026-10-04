import React from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NativeButton, displayTitle, theme } from '@template/mobile-ui';
import { StyleSheet, Text, View } from 'react-native';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <NativeButton title="Try again" onPress={retry} style={styles.button} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.paper },
          headerTintColor: theme.ink,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.paper },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.paper,
  },
  title: {
    ...displayTitle,
    color: theme.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    minWidth: 160,
  },
});
