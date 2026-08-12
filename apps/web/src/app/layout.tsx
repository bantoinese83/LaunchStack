import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LaunchStack — Modern Enterprise Full-Stack Monorepo Template',
    template: '%s | LaunchStack',
  },
  description:
    'Production-ready full-stack monorepo template built with Next.js, Expo, Supabase RLS, Stripe, Brevo, PostHog, and Sentry.',
  keywords: ['Monorepo', 'Next.js', 'Expo', 'Supabase', 'Stripe', 'React Native', 'TypeScript'],
  openGraph: {
    title: 'LaunchStack — Full-Stack Monorepo Template',
    description: 'Build enterprise B2B SaaS and cross-platform mobile apps in days.',
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
