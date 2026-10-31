import { ReferralsPanel } from './ReferralsPanel';

export default function StudioReferralsPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-medium">Referrals</h2>
      <div className="mt-6">
        <ReferralsPanel />
      </div>
    </div>
  );
}
