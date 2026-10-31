import { MYSTIC_SHOP_COMING_SOON, MYSTIC_SHOP_ENABLED } from '@template/mystic';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { MysticEmptyState } from '@/components/mystic/MysticEmptyState';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
import { MysticShopCatalogLive } from '@/components/mystic/MysticShopCatalogLive';

export function MysticShopCatalog() {
  if (MYSTIC_SHOP_ENABLED) {
    return <MysticShopCatalogLive />;
  }

  return (
    <MysticClientPage width="wide" loose>
      <MysticPageIntro
        eyebrow="Shop"
        title="At-home essentials"
        description="Pro styling products curated for house-call clients — checkout opens soon."
        className="max-w-2xl"
      />
      <MysticEmptyState
        variant="shop"
        title={MYSTIC_SHOP_COMING_SOON.title}
        description={MYSTIC_SHOP_COMING_SOON.description}
        action={
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <MysticMagneticLink href="/book">Book a house call</MysticMagneticLink>
            <MysticMagneticLink href="/messages" variant="secondary">
              Message Luke
            </MysticMagneticLink>
          </div>
        }
      />
    </MysticClientPage>
  );
}
