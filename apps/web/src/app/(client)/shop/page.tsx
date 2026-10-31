import type { Metadata } from 'next';
import { MysticShopCatalog } from '@/components/mystic/MysticShopCatalog';

export const metadata: Metadata = {
  title: 'Shop — coming soon',
  description: 'At-home styling products from Mystic Hair Co. — checkout opening soon.',
};

export default function ShopPage() {
  return <MysticShopCatalog />;
}
