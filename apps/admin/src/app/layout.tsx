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
  title: 'LaunchStack Internal Admin',
  description: 'Super Admin operations, metrics, user moderation, and audit logs.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased atlas-grain">
        {children}
      </body>
    </html>
  );
}
