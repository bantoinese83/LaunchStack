import {
  MYSTIC_SHOP_PRODUCTS,
  formatShopFulfillmentLabel,
  formatUsd,
  type MysticShopProduct,
  type ShopProductId,
} from '@template/mystic';
import { cn } from '@/lib/utils';
import { MysticShopProductIllustration } from '@/components/mystic/illustrations/MysticShopProductIllustration';
import type { ReactNode } from 'react';

type Props = {
  /** Live checkout vs pre-launch preview (shared menu layout). */
  mode: 'live' | 'preview';
  className?: string;
  renderProductAction: (product: MysticShopProduct) => ReactNode;
};

const GRID_LIVE = 'lg:grid-cols-[5.5rem_1fr_min(16rem,100%)]';
const GRID_PREVIEW = 'lg:grid-cols-[5.5rem_1fr_min(10rem,100%)]';

export function MysticShopProductCatalog({ mode, className = '', renderProductAction }: Props) {
  return (
    <ul className={className}>
      {MYSTIC_SHOP_PRODUCTS.map((product, index) => (
        <li
          key={product.id}
          className={cn(
            'mystic-menu-row py-10 first:border-t md:py-12',
            mode === 'live' && 'group',
            index === MYSTIC_SHOP_PRODUCTS.length - 1 && 'border-b border-line/70'
          )}
        >
          <div
            className={cn(
              'grid gap-8 lg:items-center lg:gap-12',
              mode === 'live' ? GRID_LIVE : GRID_PREVIEW
            )}
          >
            <div className="flex items-start gap-5 lg:flex-col lg:gap-4">
              <span
                className={cn(
                  'font-display text-3xl text-line/90',
                  mode === 'live' && 'transition group-hover:text-gold/80'
                )}
              >
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

            <div
              className={
                mode === 'live'
                  ? 'flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end lg:flex-col lg:items-end'
                  : 'flex flex-col items-start gap-2 lg:items-end'
              }
            >
              <p
                className={cn(
                  'font-display text-3xl text-ink',
                  mode === 'live' && 'sm:mr-auto lg:mr-0 lg:text-right',
                  mode === 'preview' && 'lg:text-right'
                )}
              >
                {formatUsd(product.priceCents)}
              </p>
              {renderProductAction(product)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
