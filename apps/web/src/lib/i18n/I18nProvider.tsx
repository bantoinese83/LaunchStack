'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { dictionaries, type Locale } from './dictionaries';

type Messages = (typeof dictionaries)[Locale];

const I18nContext = createContext<{
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
}>({
  locale: 'en',
  t: dictionaries.en,
  setLocale: () => undefined,
});

export function I18nProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale: (next: Locale) => {
        setLocaleState(next);
        document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = next;
      },
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
