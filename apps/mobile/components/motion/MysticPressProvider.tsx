import React, { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = { children: ReactNode };

/** Root gesture host — press springs live on NativePressableScale / NativeButton. */
export function MysticPressProvider({ children }: Props) {
  return <GestureHandlerRootView style={styles.fill}>{children}</GestureHandlerRootView>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
