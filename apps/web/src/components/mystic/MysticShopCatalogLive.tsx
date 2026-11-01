import Link from 'next/link';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticShopProductCatalog } from '@/components/mystic/MysticShopProductCatalog';
import { mysticEyebrow, mysticSectionTitle } from '@/components/mystic/mystic-styles';
import { ShopCheckoutButton } from '@/app/(client)/shop/ShopCheckoutButton';
import {
  MysticStripeEncryptedFootnote,
  MysticStripeWordmark,
} from '@/components/mystic/MysticStripeWordmark';

const TRUST = ['Pro styling products', 'stripe-secure', 'Pre-order for launch'] as const;

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
            {item === 'stripe-secure' ? (
              <span className="inline-flex items-center gap-1">
                <MysticStripeWordmark height={11} />
                <span>secure checkout</span>
              </span>
            ) : (
              item
            )}
          </li>
        ))}
      </ul>

      <MysticShopProductCatalog
        mode="live"
        className="mt-14"
        renderProductAction={(product) => <ShopCheckoutButton productId={product.id} />}
      />

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

      <MysticStripeEncryptedFootnote className="mt-10" tail="Charged when you pre-order" />

      <p className="mt-6 text-center">
        <Link href="/account" className="type-eyebrow text-muted transition hover:text-ink">
          View orders in your account →
        </Link>
      </p>
    </MysticClientPage>
  );
}
