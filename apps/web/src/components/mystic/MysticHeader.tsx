import Link from 'next/link';
import Image from 'next/image';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';

const navLink =
  'mystic-link-focus hidden rounded-full px-4 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink sm:inline';

export function MysticHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/50 bg-paper/75 px-5 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
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
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
          <Link href="/visits" className={navLink}>
            My visits
          </Link>
          <Link href="/messages" className={navLink}>
            Messages
          </Link>
          <Link href="/memberships" className={navLink}>
            Plans
          </Link>
          <Link href="/account" className={`${navLink} md:inline`}>
            Account
          </Link>
          <Link href="/shop" className={navLink}>
            Shop
          </Link>
          <MysticMagneticLink href="/book" size="sm">
            Book now
          </MysticMagneticLink>
        </nav>
      </div>
    </header>
  );
}
