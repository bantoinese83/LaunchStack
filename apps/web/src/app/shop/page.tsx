import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MYSTIC_SHOP_PRODUCTS, daysUntilLaunch, formatUsd } from '@template/mystic';
import { MysticHeader } from '@/app/(marketing)/components/mystic/MysticHeader';
import { ShopCheckoutButton } from './ShopCheckoutButton';

export const metadata: Metadata = {
  title: 'Shop — pre-order hair care',
  description:
    'Pre-order Mystic Hair Co. products for house-call blowout days. Launching spring 2026.',
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-paper">
      <MysticHeader />
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <p className="type-eyebrow text-gold">Phase 3</p>
        <h1 className="font-display mt-2 text-3xl font-medium">Shop pre-orders</h1>
        <p className="mt-2 text-muted">
          Luke-curated products for at-home styling — pay now, fulfilled at launch.
        </p>
        <ul className="mt-10 space-y-6">
          {MYSTIC_SHOP_PRODUCTS.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center"
            >
              <Image
                src={product.imagePath}
                alt=""
                width={80}
                height={80}
                className="rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted">{product.description}</p>
                <p className="mt-2 text-sm text-chalk">
                  Ships in ~{daysUntilLaunch(product.launchAt)} days ·{' '}
                  {formatUsd(product.priceCents)}
                </p>
              </div>
              <ShopCheckoutButton productId={product.id} />
            </li>
          ))}
        </ul>
        <Link href="/" className="mt-10 inline-block text-sm text-muted hover:text-ink">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
