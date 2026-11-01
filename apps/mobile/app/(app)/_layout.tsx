import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { needsClientOnboarding } from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { WELCOME_HOME } from '../../lib/clientLanding';
import { fetchClientProfile } from '../../lib/mysticApi';
import { NativeSalonLoader } from '../../components/mystic/NativeSalonLoader';
import { registerPushAndCheckUpdates } from '../../lib/updates';
import { fetchStudioAccess } from '../../lib/studioApi';

export default function AppLayout() {
  const segments = useSegments();
  const onWelcome = segments[1] === 'welcome';

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [gateReady, setGateReady] = useState(onWelcome);
  const [needsWelcome, setNeedsWelcome] = useState(false);

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

  useEffect(() => {
    if (!ready || !signedIn) return;
    if (onWelcome) {
      setNeedsWelcome(false);
      setGateReady(true);
      return;
    }

    let active = true;
    setGateReady(false);

    void (async () => {
      try {
        const access = await fetchStudioAccess();
        if (access.allowed) {
          if (active) {
            setNeedsWelcome(false);
            setGateReady(true);
          }
          return;
        }
      } catch {
        /* client */
      }

      try {
        const data = await fetchClientProfile();
        if (!active) return;
        setNeedsWelcome(needsClientOnboarding(data.profile?.onboarding_completed_at));
      } catch {
        if (active) setNeedsWelcome(false);
      } finally {
        if (active) setGateReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [ready, signedIn, onWelcome]);

  if (!ready || (signedIn && !gateReady)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.paper,
        }}
      >
        <NativeSalonLoader copyKey="default" fill hideLabel={false} />
      </View>
    );
  }

  if (!signedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsWelcome && !onWelcome) {
    return <Redirect href={WELCOME_HOME} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
