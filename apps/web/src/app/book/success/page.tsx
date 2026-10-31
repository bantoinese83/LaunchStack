import Link from 'next/link';

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; appointment_id?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="type-eyebrow text-accent">Confirmed</p>
      <h1 className="font-display mt-3 text-3xl font-medium">You&apos;re on the books</h1>
      <p className="mt-4 text-muted">
        Luke will see you soon. Check SMS and email for details.
        {params.appointment_id ? (
          <>
            <br />
            <span className="font-mono text-xs">Ref {params.appointment_id.slice(0, 8)}</span>
          </>
        ) : null}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/visits" className="rounded-full bg-shell px-6 py-3 text-sm text-paper">
          My visits
        </Link>
        <Link href="/messages" className="rounded-full border border-line px-6 py-3 text-sm">
          Message Luke
        </Link>
      </div>
    </div>
  );
}
