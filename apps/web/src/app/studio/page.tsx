import Link from 'next/link';
import { mysticCard, mysticCardHover } from '@/components/mystic/mystic-styles';
import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioTodayLoader } from './components/StudioTodayLoader';

const QUICK_LINKS = [
  { href: '/studio/messages', label: 'Client messages' },
  { href: '/studio/blasts', label: 'Send blast' },
  { href: '/studio/calendar', label: 'Calendar' },
  { href: '/studio/analytics', label: 'Analytics' },
] as const;

export default function StudioHomePage() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8">
      <section>
        <MysticStudioPageHeader
          eyebrow="Today"
          title="Operations"
          description="En route SMS, door timer, live map, and inspo — everything for today's house calls."
        />
        <MysticStudioSection>
          <StudioTodayLoader />
        </MysticStudioSection>
      </section>
      <aside className="space-y-4">
        <div className={`${mysticCard} p-5`}>
          <h3 className="text-sm font-medium text-ink">Quick links</h3>
          <ul className="mt-3 space-y-1">
            {QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm text-chalk transition hover:bg-paper/70 hover:text-ink"
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${mysticCard} ${mysticCardHover} border-gold/30 bg-gold-soft/80 p-5`}>
          <p className="type-eyebrow text-plum">Insights</p>
          <p className="mt-2 text-sm text-muted">
            Bookings, mix, and revenue the salon software never shows.
          </p>
          <Link
            href="/studio/analytics"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-chalk hover:underline"
          >
            View MTD dashboard
            <span aria-hidden>→</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
