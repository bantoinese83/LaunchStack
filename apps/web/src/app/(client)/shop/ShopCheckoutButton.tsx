'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopProductId } from '@template/mystic';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';

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
    <MysticMagneticButton
      type="button"
      size="sm"
      fullWidth
      disabled={loading}
      onClick={checkout}
      faceClassName="min-w-[9.5rem]"
    >
      {loading ? 'Opening checkout…' : 'Pre-order'}
    </MysticMagneticButton>
  );
}
