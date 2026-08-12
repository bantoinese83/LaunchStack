import Link from 'next/link';
import { BrandMark, Card } from '@template/ui';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated August 12, 2026</p>
        <Card className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
          <p>By using LaunchStack, you agree to these terms and conditions.</p>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              1. Account Responsibility
            </h2>
            <p className="mt-2">
              You are responsible for maintaining the security of your authentication credentials
              and all activity under your workspace.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              2. Acceptable Use
            </h2>
            <p className="mt-2">
              You agree not to misuse the service, perform unauthorized penetration testing, or
              attempt to bypass multi-tenant RLS isolation.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
