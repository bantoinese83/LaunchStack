import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { displayTitle, theme } from '@template/mobile-ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to sign in</Text>
        </Link>
      </View>
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
    fontSize: 22,
    color: theme.ink,
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.accent,
  },
});
