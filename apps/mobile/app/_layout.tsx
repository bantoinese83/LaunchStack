import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Caveat_500Medium, Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import * as SplashScreen from 'expo-splash-screen';
import { NativeButton, displayTitle, theme } from '@template/mobile-ui';
import { StyleSheet, Text, View } from 'react-native';
import { MysticPressProvider } from '../components/motion/MysticPressProvider';
import { NativeLaunchSplash } from '../components/mystic/NativeLaunchSplash';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* dev reload */
});

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <NativeButton title="Try again" onPress={retry} style={styles.button} />
    </View>
  );
}

const LAUNCH_MIN_MS = 2200;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_500Medium,
    Caveat_600SemiBold,
  });
  const [launchDone, setLaunchDone] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    const started = Date.now();
    const finish = () => {
      void SplashScreen.hideAsync();
      setLaunchDone(true);
    };
    const elapsed = Date.now() - started;
    const wait = Math.max(0, LAUNCH_MIN_MS - elapsed);
    const timer = setTimeout(finish, wait);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded || !launchDone) {
    return <NativeLaunchSplash />;
  }

  return (
    <MysticPressProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.paper },
          headerTintColor: theme.ink,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.paper },
          headerShadowVisible: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false, title: 'Sign in' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </MysticPressProvider>
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
