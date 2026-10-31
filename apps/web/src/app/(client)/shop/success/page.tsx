import { MysticSuccessPage } from '@/components/mystic/MysticSuccessPage';

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ preorder_id?: string }>;
}) {
  const params = await searchParams;
  const refShort = params.preorder_id?.slice(0, 8);

  return (
    <MysticSuccessPage
      eyebrow="Pre-order"
      title="Pre-order received"
      description={
        <>
          <p>Luke will reach out before fulfillment.</p>
          {refShort ? <p className="mt-2 font-mono text-xs text-muted/80">Ref {refShort}</p> : null}
        </>
      }
      actions={[
        { href: '/shop', label: 'Back to shop', primary: true },
        { href: '/visits', label: 'My visits' },
      ]}
    />
  );
}
