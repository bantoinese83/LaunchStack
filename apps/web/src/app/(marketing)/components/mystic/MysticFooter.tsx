import Link from 'next/link';

export function MysticFooter() {
  return (
    <footer className="border-t border-line bg-shell px-5 py-10 text-paper md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xl">Mystic Hair Co.</p>
          <p className="mt-2 text-sm text-paper/70">Where beauty meets intention.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/book" className="hover:text-gold">
            Book
          </Link>
          <Link href="/shop" className="hover:text-gold">
            Shop
          </Link>
          <Link href="/chicago-mobile-blowout" className="hover:text-gold">
            Chicago blowouts
          </Link>
          <Link href="/studio" className="hover:text-gold">
            Studio (Luke)
          </Link>
          <a
            href="https://instagram.com/mystichair21"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
