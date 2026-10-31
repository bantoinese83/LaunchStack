import Link from 'next/link';

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ preorder_id?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-3xl font-medium">Pre-order received</h1>
      <p className="mt-4 text-muted">
        Luke will reach out before fulfillment.
        {params.preorder_id ? (
          <>
            <br />
            <span className="font-mono text-xs">Ref {params.preorder_id.slice(0, 8)}</span>
          </>
        ) : null}
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block rounded-full border border-line px-6 py-3 text-sm"
      >
        Back to shop
      </Link>
    </div>
  );
}
