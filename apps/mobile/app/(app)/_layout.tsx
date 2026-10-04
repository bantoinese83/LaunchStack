import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { theme } from '@template/mobile-ui';
import { registerPushAndCheckUpdates } from '../../lib/updates';

export default function AppLayout() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseMobileClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.session));
      setReady(true);
      if (data.session) {
        void registerPushAndCheckUpdates();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
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

  if (!signedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
