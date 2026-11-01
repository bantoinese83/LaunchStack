import { Redirect, useLocalSearchParams } from 'expo-router';

/** Stripe return target: mystichair://membership?success=1 or ?canceled=1 */
export default function MembershipDeepLink() {
  const params = useLocalSearchParams<{
    success?: string;
    canceled?: string;
    kind?: string;
    id?: string;
  }>();

  const query = new URLSearchParams();
  if (params.success) query.set('success', String(params.success));
  if (params.canceled) query.set('canceled', String(params.canceled));
  if (params.kind) query.set('kind', String(params.kind));
  if (params.id) query.set('id', String(params.id));

  const suffix = query.toString();
  return (
    <Redirect href={suffix ? `/(app)/(tabs)/membership?${suffix}` : '/(app)/(tabs)/membership'} />
  );
}
