import type { Metadata } from 'next';
import Link from 'next/link';
import { MysticHeader } from '@/app/(marketing)/components/mystic/MysticHeader';
import { MysticFooter } from '@/app/(marketing)/components/mystic/MysticFooter';

export const metadata: Metadata = {
  title: 'Chicago mobile blowout — house call hairstylist',
  description:
    'Book a luxury blowout at your home in Chicago and River North. Mystic Hair Co. — memberships, packages, and house-call styling with Luke.',
  keywords: [
    'Chicago mobile blowout',
    'house call hairstylist Chicago',
    'River North blowout',
    'mobile hair stylist Illinois',
  ],
};

export default function ChicagoSeoPage() {
  return (
    <div className="min-h-screen bg-paper">
      <MysticHeader />
      <article className="mx-auto max-w-2xl px-5 py-12 md:px-8">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Chicago mobile blowout — at your door
        </h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          Mystic Hair Co. brings salon-quality blowouts, cuts, and updos to your home in Chicago,
          River North, and nearby neighborhoods. Book online, pick a time that works, and Luke
          arrives with pro tools — no Drybar lines, no Uber to a salon.
        </p>
        <h2 className="font-display mt-10 text-xl font-medium">Why house-call hair?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
          <li>Transparent pricing — blowouts from $45, packages and Glow/Luxe memberships</li>
          <li>Members skip evening and distance surcharges when life runs late</li>
          <li>SMS updates when Luke is on the way and at your door</li>
        </ul>
        <h2 className="font-display mt-10 text-xl font-medium">Service area</h2>
        <p className="mt-3 text-muted">
          Primary coverage: River North, Streeterville, Gold Coast, Lincoln Park, and surrounding
          Chicago zip codes. Distance fees apply beyond ~5 miles for non-members.
        </p>
        <Link
          href="/book"
          className="mt-10 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-white"
        >
          Book a house call
        </Link>
      </article>
      <MysticFooter />
    </div>
  );
}
