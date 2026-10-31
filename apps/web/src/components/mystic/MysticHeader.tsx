import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticHeaderAccountNavItem } from '@/components/mystic/MysticHeaderAccountNavItem';
import { MysticHeaderMobileNav } from '@/components/mystic/MysticHeaderMobileNav';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { MysticRoadStripe } from '@/components/mystic/MysticRoadStripe';
import type { MysticIconRole } from '@template/mystic';

const navItems: { href: string; label: string; icon: MysticIconRole }[] = [
  { href: '/visits', label: 'My visits', icon: 'visits' },
  { href: '/messages', label: 'Messages', icon: 'inbox' },
  { href: '/memberships', label: 'Plans', icon: 'plans' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
];

const navLink =
  'mystic-link-focus hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink sm:inline-flex';

export function MysticHeader() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 px-4 pt-2.5 backdrop-blur-md sm:px-5 md:px-8 md:pt-3">
      <div className="mx-auto max-w-6xl">
        <MysticRoadStripe className="mb-3 hidden sm:flex" />
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b border-line/60 pb-2.5 md:pb-3">
        <Link href="/" className="group shrink-0">
          <Image
            src="/brand/mystic-hair-logo-light.png"
            alt="Mystic Hair Co."
            width={220}
            height={56}
            className="h-10 w-auto max-w-[200px] object-contain object-left transition group-hover:opacity-90 md:h-11"
          />
          <span className="sr-only">Mystic Hair Co. — house-call blowouts, Chicago</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Account">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href as Route} className={navLink}>
              <MysticIcon name={item.icon} className="h-4 w-4 opacity-80" strokeWidth={2} />
              {item.label}
            </Link>
          ))}
          <MysticHeaderMobileNav />
          <MysticHeaderAccountNavItem />
          <MysticMagneticLink href="/book" size="sm" className="ml-1 gap-1.5 sm:ml-2">
            <MysticIcon name="book" className="h-4 w-4" strokeWidth={2.25} />
            Book now
          </MysticMagneticLink>
        </nav>
      </div>
    </header>
  );
}
