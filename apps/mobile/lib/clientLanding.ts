import { needsClientOnboarding } from '@template/mystic';
import { fetchClientProfile } from './mysticApi';
import { fetchStudioAccess } from './studioApi';

export const CLIENT_HOME = '/(app)/(tabs)/book' as const;
export const STUDIO_HOME = '/(app)/(tabs)/studio' as const;
export const WELCOME_HOME = '/(app)/welcome' as const;

export type MobileAppLanding = typeof CLIENT_HOME | typeof STUDIO_HOME | typeof WELCOME_HOME;

export async function resolveMobileAppLanding(): Promise<MobileAppLanding> {
  try {
    const access = await fetchStudioAccess();
    if (access.allowed) return STUDIO_HOME;
  } catch {
    /* client path */
  }

  try {
    const data = await fetchClientProfile();
    if (needsClientOnboarding(data.profile?.onboarding_completed_at)) {
      return WELCOME_HOME;
    }
  } catch {
    /* fall through to book */
  }

  return CLIENT_HOME;
}
