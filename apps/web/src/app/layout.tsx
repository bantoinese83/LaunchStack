import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { CookieConsent } from '@/components/CookieConsent';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { isLocale } from '@/lib/i18n/dictionaries';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'Mystic Hair Co. — Luxury house-call hair',
    template: '%s | Mystic Hair Co.',
  },
  description:
    'Mobile blowouts, cuts, and updos at your home in Chicago. Book memberships, packages, and appointments with Luke.',
  keywords: ['Chicago blowout', 'mobile hairstylist Chicago', 'house call hair', 'Mystic Hair Co'],
  openGraph: {
    title: 'Mystic Hair Co.',
    description: 'Luxury hair, delivered to you — house calls in Chicago.',
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
      className={`${display.variable} ${GeistSans.variable} ${mono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <I18nProvider locale={locale}>
          {children}
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
