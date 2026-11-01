import { Redirect } from 'expo-router';

/** Entry: sign-in (no marketing homepage — see lib/clientLanding.ts). */
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
