import Link from 'next/link';
import Image from 'next/image';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticSignInOrAccountNav } from '@/components/mystic/MysticSignInOrAccountNav';

const navLink =
  'mystic-link-focus hidden type-eyebrow text-muted transition hover:text-ink sm:inline-block sm:px-3 sm:py-2';

type Props = {
  initialSignedIn?: boolean;
};

/** Landing header — large wordmark, minimal mid-century nav */
export function MysticMarketingHeader({ initialSignedIn = false }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/40 bg-paper/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8 md:py-5">
        <Link href="/" className="group shrink-0">
          <Image
            src="/brand/mystic-hair-logo-light.png"
            alt="Mystic Hair Co."
            width={240}
            height={72}
            priority
            className="h-11 w-auto max-w-[min(220px,58vw)] object-contain object-left transition group-hover:opacity-90 md:h-14 md:max-w-[260px]"
          />
          <span className="sr-only">Mystic Hair Co. — house-call blowouts, Chicago</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <Link href="#services" className={navLink}>
            Services
          </Link>
          <Link href="#memberships" className={navLink}>
            Memberships
          </Link>
          <MysticSignInOrAccountNav
            initialSignedIn={initialSignedIn}
            signInClassName={`${navLink} md:inline-block`}
            accountClassName={`${navLink} inline-flex items-center gap-1.5 md:inline-flex`}
          />
          <MysticMagneticLink href="/book" size="sm">
            Book
          </MysticMagneticLink>
        </nav>
      </div>
    </header>
  );
}
