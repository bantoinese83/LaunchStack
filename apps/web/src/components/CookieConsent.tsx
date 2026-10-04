'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@template/ui';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { requireBrowserSession } from '@/lib/supabase/browser-session';

const STORAGE_KEY = 'launchstack-consent';
const emptySubscribe = () => () => undefined;

export function CookieConsent() {
  const { t } = useI18n();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const stored = useSyncExternalStore(
    emptySubscribe,
    () => window.localStorage.getItem(STORAGE_KEY),
    () => 'ssr'
  );
  const [dismissed, setDismissed] = useState(false);

  const persist = async (analytics: boolean, marketing: boolean) => {
    const value = JSON.stringify({ necessary: true, analytics, marketing });
    window.localStorage.setItem(STORAGE_KEY, value);
    setDismissed(true);
    const session = await requireBrowserSession();
    if (!session) return;
    await authorizedFetch('/api/privacy/consent', {
      method: 'POST',
      body: JSON.stringify({ analytics, marketing }),
    }).catch(() => undefined);
  };

  if (!mounted || stored || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 p-4 shadow-[0_-12px_40px_-24px_rgba(20,19,19,0.45)] backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base font-medium text-ink">{t.consentTitle}</p>
          <p className="mt-1 text-sm text-muted">{t.consentBody}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => void persist(false, false)}>
            {t.rejectOptional}
          </Button>
          <Button variant="primary" size="sm" onClick={() => void persist(true, true)}>
            {t.acceptAll}
          </Button>
        </div>
      </div>
    </div>
  );
}
