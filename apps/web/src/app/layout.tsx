import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Fraunces, IBM_Plex_Mono, Instrument_Sans, Newsreader } from 'next/font/google';
import { CookieConsent } from '@/components/CookieConsent';
import { SkipToMain } from '@/components/mystic/SkipToMain';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { isLocale } from '@/lib/i18n/dictionaries';
import './globals.css';

/** Variable fonts — omit weight/style arrays (Turbopack-safe; see next/font/google). */
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mystic Hair Co. — House-call hair, Chicago',
    template: '%s | Mystic Hair Co.',
  },
  description:
    'Mobile blowouts, cuts, and updos at your home in Chicago. Book memberships, packages, and appointments with Luke.',
  keywords: ['Chicago blowout', 'mobile hairstylist Chicago', 'house call hair', 'Mystic Hair Co'],
  openGraph: {
    title: 'Mystic Hair Co.',
    description: 'House-call blowouts, cuts, and updos in Chicago and River North.',
    url: 'https://mystichair.co',
    siteName: 'Mystic Hair Co.',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get('locale')?.value;
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <SkipToMain />
        <I18nProvider locale={locale}>
          {children}
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
