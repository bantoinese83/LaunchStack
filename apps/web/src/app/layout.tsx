import type { Metadata } from 'next';
import { Syne, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const display = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'LaunchStack — Enterprise monorepo starter',
    template: '%s | LaunchStack',
  },
  description:
    'Production-ready full-stack monorepo for B2B SaaS and native apps — Next.js, Expo, Supabase, Stripe.',
  keywords: ['Monorepo', 'Next.js', 'Expo', 'Supabase', 'Stripe', 'React Native', 'TypeScript'],
  openGraph: {
    title: 'LaunchStack — Full-Stack Monorepo Template',
    description: 'Build enterprise B2B SaaS and cross-platform mobile apps with shared packages.',
    url: 'https://launchstack.com',
    siteName: 'LaunchStack',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
