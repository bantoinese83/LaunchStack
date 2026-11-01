import { MYSTIC_SHOP_ENABLED } from '@template/mystic';
import { MysticShopCatalogLive } from '@/components/mystic/MysticShopCatalogLive';
import { MysticShopComingSoon } from '@/components/mystic/MysticShopComingSoon';

export function MysticShopCatalog() {
  if (MYSTIC_SHOP_ENABLED) {
    return <MysticShopCatalogLive />;
  }

  return <MysticShopComingSoon />;
}
