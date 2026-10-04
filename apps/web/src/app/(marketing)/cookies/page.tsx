import Link from 'next/link';
import { BrandMark, Card } from '@template/ui';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-paper atlas-grain text-ink">
      <div className="mx-auto max-w-3xl px-6 py-14 animate-[rise_400ms_ease-out]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <BrandMark size="sm" />
          <span>Back to LaunchStack</span>
        </Link>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink">
          Cookie policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated October 4, 2026</p>
        <Card className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
          <p>
            LaunchStack stores a <code>launchstack-consent</code> cookie after you choose analytics
            and marketing preferences. Session cookies from Supabase Auth are required to keep you
            signed in.
          </p>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Necessary
            </h2>
            <p className="mt-2">
              Auth session, locale, and CSRF-adjacent cookie writes used by the Next.js apps. These
              cannot be turned off.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Analytics
            </h2>
            <p className="mt-2">
              PostHog only initializes after you accept analytics. No events are sent without that
              opt-in.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Marketing
            </h2>
            <p className="mt-2">
              Reserved for optional campaign pixels. The template does not load third-party ads by
              default.
            </p>
          </div>
          <p>
            Change your choice any time from the banner on first visit, or delete the consent cookie
            in your browser.
          </p>
        </Card>
      </div>
    </div>
  );
}
