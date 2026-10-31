'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopProductId } from '@template/mystic';

export function ShopCheckoutButton({ productId }: { productId: ShopProductId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch('/api/mystic/checkout/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login?next=/shop');
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={checkout}
      className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {loading ? '…' : 'Pre-order'}
    </button>
  );
}
