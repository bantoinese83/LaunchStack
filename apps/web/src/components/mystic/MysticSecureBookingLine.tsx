import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { MysticStripeWordmark } from '@/components/mystic/MysticStripeWordmark';

type Props = {
  className?: string;
};

/** Zocdoc-style reassurance on checkout review. */
export function MysticSecureBookingLine({ className = '' }: Props) {
  return (
    <p
      className={`flex items-center justify-center gap-2 text-center text-xs text-muted ${className}`}
    >
      <MysticIcon name="secure" className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.25} />
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
        <span className="font-medium text-ink/80">Secure booking</span>
        <span>· Encrypted checkout via</span>
        <MysticStripeWordmark />
        <span>. Your card is charged after Luke confirms your time.</span>
      </span>
    </p>
  );
}
