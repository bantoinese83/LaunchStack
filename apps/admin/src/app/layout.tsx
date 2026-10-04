import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
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
  title: 'LaunchStack Internal Admin',
  description: 'Super Admin operations, metrics, user moderation, and audit logs.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${GeistSans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
