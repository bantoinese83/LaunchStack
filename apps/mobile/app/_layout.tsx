import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Caveat_500Medium, Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import * as SplashScreen from 'expo-splash-screen';
import { NativeButton, displayTitle, theme } from '@template/mobile-ui';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MysticPressProvider } from '../components/motion/MysticPressProvider';
import { NativeFlowerField } from '../components/mystic/NativeFlowerField';
import { NativeLaunchSplashContent } from '../components/mystic/NativeLaunchSplashContent';

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

/** Let launch blooms mostly open before crossfade (~3.6s bloom + stagger). */
const LAUNCH_HOLD_MS = 3000;
const LAUNCH_FADE_MS = 650;

function RootLayoutInner() {
  const [fontsLoaded] = useFonts({
    Caveat_500Medium,
    Caveat_600SemiBold,
  });
  const [appInteractive, setAppInteractive] = useState(false);
  const [flowerMode, setFlowerMode] = useState<'launch' | 'idle'>('launch');
  const splashOpacity = useSharedValue(1);
  const appOpacity = useSharedValue(0);

  useEffect(() => {
    if (!fontsLoaded) return;
    const hold = setTimeout(() => {
      void SplashScreen.hideAsync();
      appOpacity.value = withTiming(1, {
        duration: LAUNCH_FADE_MS,
        easing: Easing.out(Easing.cubic),
      });
      splashOpacity.value = withTiming(
        0,
        { duration: LAUNCH_FADE_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setAppInteractive)(true);
        }
      );
    }, LAUNCH_HOLD_MS);
    return () => clearTimeout(hold);
  }, [appOpacity, fontsLoaded, splashOpacity]);

  useEffect(() => {
    if (!appInteractive) return;
    const id = setTimeout(() => setFlowerMode('idle'), 500);
    return () => clearTimeout(id);
  }, [appInteractive]);

  const splashLayerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  const appLayerStyle = useAnimatedStyle(() => ({
    opacity: appOpacity.value,
  }));

  return (
    <View style={styles.shell}>
      <NativeFlowerField mode={flowerMode} count={24} opacity={0.72} />
      {fontsLoaded ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, appLayerStyle]}
          pointerEvents={appInteractive ? 'auto' : 'none'}
        >
          <MysticPressProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: theme.paper },
                headerTintColor: theme.ink,
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: 'transparent' },
                headerShadowVisible: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="auth/callback"
                options={{ headerShown: false, title: 'Sign in' }}
              />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
          </MysticPressProvider>
        </Animated.View>
      ) : null}
      {fontsLoaded ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, splashLayerStyle]}
          pointerEvents={appInteractive ? 'none' : 'auto'}
        >
          <NativeLaunchSplashContent />
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: theme.paper,
  },
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
