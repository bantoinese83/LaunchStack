import Link from 'next/link';
import Image from 'next/image';

export function MysticHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/brand/mystic-hair-logo.jpeg"
          alt="Mystic Hair Co."
          width={44}
          height={44}
          className="rounded-full object-cover ring-1 ring-line"
        />
        <div>
          <p className="font-display text-lg font-medium tracking-tight text-ink">
            Mystic Hair Co.
          </p>
          <p className="text-xs text-muted">House-call blowouts · Chicago</p>
        </div>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/visits"
          className="hidden rounded-full px-4 py-2 text-sm text-muted hover:text-ink sm:inline"
        >
          My visits
        </Link>
        <Link
          href="/account"
          className="hidden rounded-full px-4 py-2 text-sm text-muted hover:text-ink md:inline"
        >
          Account
        </Link>
        <Link href="/shop" className="hidden text-sm text-muted hover:text-ink sm:inline">
          Shop
        </Link>
        <Link
          href="/book"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
        >
          Book now
        </Link>
      </nav>
    </header>
  );
}
