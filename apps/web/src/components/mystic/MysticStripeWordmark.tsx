import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Square PNG with padding — needs ~40px+ display box for a legible wordmark. */
export const MYSTIC_STRIPE_WORDMARK_SIZE = {
  inline: 40,
  footnote: 48,
  button: 56,
} as const;

type Props = {
  /** Square display box (px). Width and height match the asset aspect. */
  size?: number;
  className?: string;
};

/** Official Stripe wordmark for inline trust / checkout copy. */
export function MysticStripeWordmark({
  size = MYSTIC_STRIPE_WORDMARK_SIZE.inline,
  className,
}: Props) {
  return (
    <Image
      src="/brand/stripe-wordmark.png"
      alt="Stripe"
      width={size}
      height={size}
      unoptimized
      className={cn('inline-block shrink-0 object-contain', className)}
      style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
    />
  );
}

export function MysticPayWithStripeLabel({
  logoSize = MYSTIC_STRIPE_WORDMARK_SIZE.button,
}: {
  logoSize?: number;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span>Pay with</span>
      <MysticStripeWordmark size={logoSize} className="align-middle" />
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
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
        <span>Secure checkout ·</span>
        <MysticStripeWordmark size={MYSTIC_STRIPE_WORDMARK_SIZE.footnote} />
        <span>-encrypted · {tail}</span>
      </span>
    </p>
  );
}
