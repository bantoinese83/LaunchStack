/** Phase 3 — product catalog (pre-order before full shop launch). */

/** Flip to true when Stripe checkout and fulfillment are live. */
export const MYSTIC_SHOP_ENABLED = false;

export const MYSTIC_SHOP_COMING_SOON = {
  title: 'Coming soon',
  description:
    'Luke is finishing the at-home product line — volume mist, heat shield, and silk serum. Book a house call and he can recommend a routine until checkout opens here.',
  compactDescription: 'Product checkout opens soon.',
} as const;

export const SHOP_PRODUCT_IDS = ['volume_mist', 'heat_shield', 'silk_serum'] as const;
export type ShopProductId = (typeof SHOP_PRODUCT_IDS)[number];

export type MysticShopProduct = {
  id: ShopProductId;
  name: string;
  /** Short label under the title (e.g. category) */
  category: string;
  description: string;
  priceCents: number;
  /** ISO date when Luke targets in-hand delivery */
  launchAt: string;
  /** Optional hero photo — editorial SVG used in app when omitted */
  imagePath?: string;
};

export const MYSTIC_SHOP_PRODUCTS: MysticShopProduct[] = [
  {
    id: 'volume_mist',
    name: 'Mystic Volume Mist',
    category: 'Root lift',
    description: 'Lightweight root lift for blowout days — Luke’s house-call staple.',
    priceCents: 2800,
    launchAt: '2026-05-01',
  },
  {
    id: 'heat_shield',
    name: 'Heat Shield Spray',
    category: 'Heat care',
    description: 'Protects through hot-tool styling on the go.',
    priceCents: 3200,
    launchAt: '2026-05-01',
  },
  {
    id: 'silk_serum',
    name: 'Silk Finish Serum',
    category: 'Finish',
    description: 'Smooth, camera-ready shine without weight.',
    priceCents: 3800,
    launchAt: '2026-05-15',
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

/** Human fulfillment line for shop cards (avoids awkward “~0 days”). */
export function formatShopFulfillmentLabel(isoDate: string, now = new Date()): string {
  const days = daysUntilLaunch(isoDate, now);
  if (days > 45) {
    const launch = new Date(`${isoDate}T12:00:00`);
    const month = launch.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return `Pre-order · fulfills ${month}`;
  }
  if (days > 0) {
    return `Pre-order · ships in ~${days} days`;
  }
  return 'Pre-order · ships in 5–7 business days';
}
