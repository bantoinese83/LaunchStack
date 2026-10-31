import Link from 'next/link';
import { mysticCard } from '@/components/mystic/mystic-styles';
import { StudioOpsPanel } from './components/StudioOpsPanel';
import { StudioTodayLoader } from './components/StudioTodayLoader';

export default function StudioHomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <section>
        <p className="type-eyebrow text-accent">Today</p>
        <h2 className="font-display mt-2 text-2xl font-medium tracking-tight">Operations</h2>
        <p className="mt-1 text-sm text-muted">
          En route SMS, door timer, and live status for house calls.
        </p>
        <div className="mt-6">
          <StudioTodayLoader />
        </div>
      </section>
      <aside className="space-y-4">
        <div className={`${mysticCard} p-5`}>
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
        <div className={`${mysticCard} border-gold/30 bg-gold-soft/80 p-5`}>
          <p className="type-eyebrow text-plum">Insights</p>
          <Link
            href="/studio/analytics"
            className="mt-2 inline-block text-sm font-medium text-chalk hover:underline"
          >
            View MTD dashboard →
          </Link>
        </div>
      </aside>
    </div>
  );
}
