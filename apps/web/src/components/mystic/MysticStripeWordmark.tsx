import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  /** Render height in px (width follows asset aspect). */
  height?: number;
  className?: string;
};

/** Official Stripe wordmark for inline trust / checkout copy. */
export function MysticStripeWordmark({ height = 14, className }: Props) {
  const width = Math.round(height * 2.55);
  return (
    <Image
      src="/brand/stripe-wordmark.png"
      alt="Stripe"
      width={width}
      height={height}
      className={cn('inline-block w-auto object-contain align-[-0.15em]', className)}
      style={{ height, width: 'auto', maxWidth: width }}
    />
  );
}

export function MysticPayWithStripeLabel({ logoHeight = 16 }: { logoHeight?: number }) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <span>Pay with</span>
      <MysticStripeWordmark height={logoHeight} />
    </span>
  );
}

type FootnoteProps = {
  tail: string;
  className?: string;
};

/** “Secure checkout · [Stripe]-encrypted · …” */
export function MysticStripeEncryptedFootnote({ tail, className = '' }: FootnoteProps) {
  return (
    <p className={cn('type-eyebrow text-center text-muted', className)}>
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
        Secure checkout · <MysticStripeWordmark height={11} />
        <span>-encrypted · {tail}</span>
      </span>
    </p>
  );
}
