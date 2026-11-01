'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MYSTIC_REFERRAL_QUERY_PARAM } from '@template/mystic';
import { captureReferralFromSearchParam } from '@/lib/mystic/referral-storage';

/** Persists `?ref=` from the URL into localStorage (auth + marketing pages). */
export function MysticReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureReferralFromSearchParam(searchParams.get(MYSTIC_REFERRAL_QUERY_PARAM));
  }, [searchParams]);

  return null;
}
