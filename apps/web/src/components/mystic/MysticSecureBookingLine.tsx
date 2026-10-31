import { Lock } from 'lucide-react';

type Props = {
  className?: string;
};

/** Zocdoc-style reassurance on checkout review. */
export function MysticSecureBookingLine({ className = '' }: Props) {
  return (
    <p
      className={`flex items-center justify-center gap-2 text-center text-xs text-muted ${className}`}
    >
      <Lock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
      <span>
        <span className="font-medium text-ink/80">Secure booking</span>
        {' · '}
        Encrypted checkout via Stripe. Your card is charged after Luke confirms your time.
      </span>
    </p>
  );
}
