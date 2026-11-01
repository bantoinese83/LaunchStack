import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Soft tick for taps — selection on iOS, light impact on Android. */
export function hapticSelect() {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync().catch(() => {
    /* simulator / unsupported */
  });
}

/** Confirm a successful submit (send, save, book). */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Soft impact for toggles and segment changes. */
export function hapticSoft() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
