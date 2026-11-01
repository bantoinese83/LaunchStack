'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticSignInOrAccountNav } from '@/components/mystic/MysticSignInOrAccountNav';
import { cn } from '@/lib/utils';
import { MysticFooterBlockWordmark } from '@/components/mystic/MysticFooterBlockWordmark';

const linkCols = [
  {
    title: 'Book',
    links: [
      { href: '/book', label: 'House calls' },
      { href: '/memberships', label: 'Memberships' },
      { href: '/#services', label: 'Services' },
    ],
  },
  {
    title: 'Client',
    links: [
      { href: '/visits', label: 'My visits' },
      { href: '/messages', label: 'Messages' },
      { href: '/account', label: 'Account' },
    ],
  },
  {
    title: 'More',
    links: [
      { href: '/shop', label: 'Shop' },
      { href: '/studio', label: "Luke's Studio" },
      { href: '/chicago-mobile-blowout', label: 'Chicago blowouts' },
    ],
  },
] as const;

const footerLink =
  'text-sm text-paper/75 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-shell';

type FooterProps = {
  initialSignedIn?: boolean;
};

/** Editorial footer — 21st-inspired outline wordmark + CTA band (scrollxui / balick patterns). */
export function MysticFooter({ initialSignedIn = false }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mystic-footer-shell mystic-footer-grain mystic-pattern-band relative overflow-x-hidden border-t border-gold/15 text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mystic-pattern-overlapping-cubes opacity-[0.52]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-shell/55 via-shell/15 to-shell/70"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-8 border-b border-white/10 py-14 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-md">
            <p className="type-eyebrow text-gold">House calls · Chicago</p>
            <h2 className="type-hand-lg mt-3 text-paper">Your next blowout starts here.</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-paper/60">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold/80" aria-hidden />
              River North & mapped house-call area
            </p>
          </div>
          <MysticMagneticLink href="/book">Book a house call</MysticMagneticLink>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)] md:gap-16">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/brand/mystic-hair-logo-dark.png"
                alt="Mystic Hair Co."
                width={240}
                height={64}
                className="h-12 w-auto max-w-[240px] object-contain object-left"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/65">
              Blowouts, cuts, and updos at your door — memberships, packages, and online booking.
            </p>
            <a
              href="https://instagram.com/mystichair21"
              target="_blank"
              rel="noreferrer"
              className={cn(
                footerLink,
                'mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:border-gold/35 hover:bg-white/8'
              )}
            >
              @mystichair21
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {linkCols.map((col) => (
              <div key={col.title}>
                <p className="type-eyebrow text-paper/45">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={footerLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-paper/45 md:flex-row md:items-center md:justify-between">
          <p>© {year} Mystic Hair Co. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className={footerLink}>
              Privacy
            </Link>
            <Link href="/terms" className={footerLink}>
              Terms
            </Link>
            <MysticSignInOrAccountNav
              initialSignedIn={initialSignedIn}
              signInClassName={footerLink}
              accountClassName={`${footerLink} inline-flex items-center gap-1.5`}
            />
          </div>
        </div>
      </div>

      <MysticFooterBlockWordmark />
    </footer>
  );
}
