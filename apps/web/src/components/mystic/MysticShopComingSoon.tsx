import { MYSTIC_SHOP_COMING_SOON } from '@template/mystic';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticShopProductCatalog } from '@/components/mystic/MysticShopProductCatalog';
import { MysticPatternBand, mysticPatternBandEyebrow } from '@/components/mystic/MysticPatternBand';
import { mysticSectionTitle } from '@/components/mystic/mystic-styles';

/** Pre-launch shop — same catalog rhythm as live shop, without checkout or empty-state card. */
export function MysticShopComingSoon() {
  return (
    <MysticClientPage width="wide" loose>
      <MysticPageIntro
        eyebrow="Shop"
        title={MYSTIC_SHOP_COMING_SOON.title}
        description={MYSTIC_SHOP_COMING_SOON.description}
        className="max-w-2xl"
      />

      <p className="type-eyebrow mt-8 inline-flex rounded-full border border-line/70 bg-surface px-3 py-1.5 text-muted">
        Checkout opens soon · Stripe pre-order when ready
      </p>

      <MysticShopProductCatalog
        mode="preview"
        className="mt-12"
        renderProductAction={() => (
          <span className="type-eyebrow rounded-full bg-chalk-soft px-3 py-1 text-muted">
            Not available yet
          </span>
        )}
      />

      <MysticPatternBand>
        <p className={mysticPatternBandEyebrow}>Until checkout opens</p>
        <h2 className={`${mysticSectionTitle} mt-2 text-paper`}>
          Get a routine on your next visit
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-paper/80 md:text-base">
          Book a house call and Luke can recommend what to grab first — volume, heat protection, or
          finish — based on your hair and tools at home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MysticMagneticLink href="/book" surface="dark">
            Book a house call
          </MysticMagneticLink>
          <MysticMagneticLink href="/messages" variant="secondary" surface="dark">
            Message Luke
          </MysticMagneticLink>
        </div>
      </MysticPatternBand>
    </MysticClientPage>
  );
}
