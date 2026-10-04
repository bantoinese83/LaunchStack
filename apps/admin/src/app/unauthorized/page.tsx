import { Alert, BrandMark, Button, Card } from '@template/ui';

export default function UnauthorizedPage() {
  const webAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <div className="flex min-h-screen items-center justify-center bg-shell p-6">
      <Card className="w-full max-w-md text-center">
        <BrandMark className="mx-auto" />
        <p className="type-eyebrow mt-4 text-accent">LaunchStack Admin</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink">
          Access denied
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This portal requires a signed-in user with{' '}
          <code className="rounded-md bg-paper px-1.5 py-0.5 font-mono text-xs text-chalk">
            system_role = super_admin
          </code>
          .
        </p>
        <Alert className="mt-5 text-left" variant="error">
          Sign in through the main app with a super-admin account, then return here.
        </Alert>
        {/* Cross-origin link to the customer app, so this is a plain anchor
            rather than a Next <Link> (typedRoutes rejects external URLs). */}
        <a href={webAppUrl} className="mt-6 block">
          <Button variant="primary" className="w-full">
            Go to LaunchStack
          </Button>
        </a>
      </Card>
    </div>
  );
}
