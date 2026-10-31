import Link from 'next/link';
import { StudioOpsPanel } from './components/StudioOpsPanel';
import { StudioTodayLoader } from './components/StudioTodayLoader';

export default function StudioHomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <section>
        <h2 className="font-display text-2xl font-medium">Operations</h2>
        <p className="mt-1 text-sm text-muted">
          En route SMS, door timer, and live status — Phase 2.
        </p>
        <div className="mt-6">
          <StudioTodayLoader />
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-sm font-medium">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/studio/blasts" className="text-chalk hover:underline">
                Send blast
              </Link>
            </li>
            <li>
              <Link href="/studio/messages" className="text-chalk hover:underline">
                Client messages
              </Link>
            </li>
            <li>
              <Link href="/studio/analytics" className="text-chalk hover:underline">
                Analytics
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-gold-soft p-5">
          <p className="text-sm text-muted">Analytics</p>
          <Link
            href="/studio/analytics"
            className="mt-2 inline-block text-sm text-chalk hover:underline"
          >
            View MTD dashboard →
          </Link>
        </div>
      </aside>
    </div>
  );
}
