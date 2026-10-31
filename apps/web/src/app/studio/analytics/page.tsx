import { AnalyticsPanel } from './AnalyticsPanel';

export default function StudioAnalyticsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium">Analytics</h2>
      <p className="mt-1 text-sm text-muted">What Vagaro doesn&apos;t show — bookings & mix.</p>
      <div className="mt-6">
        <AnalyticsPanel />
      </div>
    </div>
  );
}
