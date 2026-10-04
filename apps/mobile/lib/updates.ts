import { Platform } from 'react-native';

export async function registerPushAndCheckUpdates() {
  try {
    const Updates = await import('expo-updates');
    if (!__DEV__ && Updates.isEnabled) {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    }
  } catch (error) {
    console.warn('[updates]', error);
  }

  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    if (!Device.isDevice) return;
    const existing = await Notifications.getPermissionsAsync();
    const status =
      existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
    if (status.status !== 'granted') return;
    const token = await Notifications.getExpoPushTokenAsync();
    const appUrl = process.env.EXPO_PUBLIC_APP_URL;
    const supabase = (await import('@template/api/mobile')).createSupabaseMobileClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (appUrl && session?.access_token && token.data) {
      await fetch(`${appUrl}/api/push/send`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.data, platform: Platform.OS }),
      });
    }
  } catch (error) {
    console.warn('[notifications]', error);
  }
}
