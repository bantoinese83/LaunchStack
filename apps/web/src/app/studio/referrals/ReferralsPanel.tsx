'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_REFERRAL_REWARD_AFTER } from '@template/mystic';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

type Referral = {
  id: string;
  referred_name: string;
  referrer_user_id: string;
  credited: boolean;
  created_at: string;
};

export function ReferralsPanel() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const workspaceId = getMysticWorkspaceId();

  useEffect(() => {
    void fetch(`/api/mystic/referrals?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => setReferrals(data.referrals ?? []))
      .catch(() => setReferrals([]));
  }, [workspaceId]);

  return (
    <div>
      <p className="text-sm text-muted">
        Reward after {DEFAULT_REFERRAL_REWARD_AFTER} credited referrals (configure in Settings).
      </p>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
        {referrals.length === 0 ? (
          <li className="p-6 text-sm text-muted">No referrals yet.</li>
        ) : (
          referrals.map((row) => (
            <li key={row.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{row.referred_name}</span>
              <span className="text-muted">
                {row.credited ? 'Rewarded' : 'Pending'} ·{' '}
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
