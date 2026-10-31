import Link from 'next/link';
import {
  MYSTIC_SHOP_PRODUCTS,
  formatShopFulfillmentLabel,
  formatUsd,
  type ShopProductId,
} from '@template/mystic';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticShopProductIllustration } from '@/components/mystic/illustrations/MysticShopProductIllustration';
import { mysticEyebrow, mysticSectionTitle } from '@/components/mystic/mystic-styles';
import { ShopCheckoutButton } from '@/app/(client)/shop/ShopCheckoutButton';

const TRUST = ['Pro styling products', 'Stripe secure checkout', 'Pre-order for launch'];

/** Full catalog — shown when `MYSTIC_SHOP_ENABLED` is true. */
export function MysticShopCatalogLive() {
  return (
    <MysticClientPage width="wide" loose>
      <MysticPageIntro
        eyebrow="Shop"
        title="At-home essentials"
        description="Pre-order at-home styling products — pay now, fulfilled as each item is ready to ship."
        className="max-w-2xl"
      />

      <ul className="flex flex-wrap gap-x-8 gap-y-2 border-y border-line/60 py-4">
        {TRUST.map((item) => (
          <li key={item} className={`${mysticEyebrow} text-muted`}>
            {item}
          </li>
        ))}
      </ul>

      <ul className="mt-14">
        {MYSTIC_SHOP_PRODUCTS.map((product, index) => (
          <li
            key={product.id}
            className={`mystic-menu-row group py-10 first:border-t md:py-12 ${
              index === MYSTIC_SHOP_PRODUCTS.length - 1 ? 'border-b border-line/70' : ''
            }`}
          >
            <div className="grid gap-8 lg:grid-cols-[5.5rem_1fr_min(16rem,100%)] lg:items-center lg:gap-12">
              <div className="flex items-start gap-5 lg:flex-col lg:gap-4">
                <span className="font-display text-3xl text-line/90 transition group-hover:text-gold/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <MysticShopProductIllustration productId={product.id as ShopProductId} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="type-display-md text-ink">{product.name}</h2>
                  <span className="type-eyebrow text-accent">{product.category}</span>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                  {product.description}
                </p>
                <p className="type-eyebrow mt-4 text-chalk">
                  {formatShopFulfillmentLabel(product.launchAt)}
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end lg:flex-col lg:items-end">
                <p className="font-display text-3xl text-ink sm:mr-auto lg:mr-0 lg:text-right">
                  {formatUsd(product.priceCents)}
                </p>
                <ShopCheckoutButton productId={product.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section className="mystic-footer-grain relative mt-16 overflow-hidden rounded-[1.35rem] border border-line/50 bg-plum px-6 py-10 text-paper md:px-10 md:py-12">
        <p className={mysticEyebrow}>House calls</p>
        <h2 className={`${mysticSectionTitle} mt-2 text-paper`}>Not sure what to pre-order?</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-paper/80 md:text-base">
          Book a visit and Luke can recommend a routine for your hair texture, tools, and how often
          you style at home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MysticMagneticLink href="/book" surface="dark">
            Book a house call
          </MysticMagneticLink>
          <MysticMagneticLink href="/messages" variant="secondary" surface="dark">
            Message Luke
          </MysticMagneticLink>
        </div>
      </section>

      <p className="type-eyebrow mt-10 text-center text-muted">
        Secure checkout · Stripe-encrypted · Charged when you pre-order
      </p>

      <p className="mt-6 text-center">
        <Link href="/account" className="type-eyebrow text-muted transition hover:text-ink">
          View orders in your account →
        </Link>
      </p>
    </MysticClientPage>
  );
}
