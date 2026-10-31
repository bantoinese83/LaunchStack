/** Phase 3 — product catalog (pre-order before full shop launch). */

export const SHOP_PRODUCT_IDS = ['volume_mist', 'heat_shield', 'silk_serum'] as const;
export type ShopProductId = (typeof SHOP_PRODUCT_IDS)[number];

export type MysticShopProduct = {
  id: ShopProductId;
  name: string;
  description: string;
  priceCents: number;
  /** ISO date when Luke targets in-hand delivery */
  launchAt: string;
  imagePath: string;
};

export const MYSTIC_SHOP_PRODUCTS: MysticShopProduct[] = [
  {
    id: 'volume_mist',
    name: 'Mystic Volume Mist',
    description: 'Lightweight root lift for blowout days — Luke’s house-call staple.',
    priceCents: 2800,
    launchAt: '2026-05-01',
    imagePath: '/brand/mystic-hair-logo.jpeg',
  },
  {
    id: 'heat_shield',
    name: 'Heat Shield Spray',
    description: 'Protects through hot-tool styling on the go.',
    priceCents: 3200,
    launchAt: '2026-05-01',
    imagePath: '/brand/mystic-hair-logo.jpeg',
  },
  {
    id: 'silk_serum',
    name: 'Silk Finish Serum',
    description: 'Smooth, camera-ready shine without weight.',
    priceCents: 3600,
    launchAt: '2026-05-15',
    imagePath: '/brand/mystic-hair-logo.jpeg',
  },
];

export function getShopProductById(id: ShopProductId): MysticShopProduct {
  const product = MYSTIC_SHOP_PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown shop product: ${id}`);
  return product;
}

export function daysUntilLaunch(isoDate: string, now = new Date()): number {
  const launch = new Date(`${isoDate}T12:00:00`);
  return Math.max(0, Math.ceil((launch.getTime() - now.getTime()) / 86400000));
}
