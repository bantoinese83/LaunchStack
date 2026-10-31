import type { Metadata } from 'next';
import { MysticShopCatalog } from '@/components/mystic/MysticShopCatalog';

export const metadata: Metadata = {
  title: 'Shop — at-home hair care',
  description:
    'Pre-order Mystic Hair Co. at-home products — volume mist, heat shield, and finish serum.',
};

export default function ShopPage() {
  return <MysticShopCatalog />;
}
