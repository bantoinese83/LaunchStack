import { Redirect, useLocalSearchParams } from 'expo-router';

/** Stripe cancel: mystichair://book?canceled=1 */
export default function BookDeepLink() {
  const params = useLocalSearchParams<{ canceled?: string }>();
  if (params.canceled === '1') {
    return <Redirect href="/(app)/(tabs)/book?canceled=1" />;
  }
  return <Redirect href="/(app)/(tabs)/book" />;
}
