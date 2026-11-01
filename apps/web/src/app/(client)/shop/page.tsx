import type { Metadata } from 'next';
import { MysticShopCatalog } from '@/components/mystic/MysticShopCatalog';

export const metadata: Metadata = {
  title: 'Shop — at-home essentials',
  description:
    'Volume mist, heat shield, and silk serum from Mystic Hair Co. — checkout opening soon.',
};

export default function ShopPage() {
  return <MysticShopCatalog />;
}
