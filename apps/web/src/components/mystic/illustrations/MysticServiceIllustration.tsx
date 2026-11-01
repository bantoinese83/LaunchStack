import { type ServiceId } from '@template/mystic';
import { MysticServiceCardImage } from '@/components/mystic/MysticServiceCardImage';
import { cn } from '@/lib/utils';

type Props = {
  serviceId: ServiceId;
  className?: string;
  /** sm = visit rows; md = compact; lg = marketing menu (wide thumb). */
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-14 w-14',
  md: 'h-[4.75rem] w-[4.75rem]',
  lg: 'h-[5.75rem] w-[9.25rem] sm:h-24 sm:w-[10.5rem] md:h-28 md:w-[12.5rem]',
};

const SIZE_PX: Record<NonNullable<Props['size']>, number> = {
  sm: 56,
  md: 76,
  lg: 200,
};

/** Service row photography — same assets as book-flow cards. */
export function MysticServiceIllustration({ serviceId, className = '', size = 'md' }: Props) {
  const px = SIZE_PX[size];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line/40 shadow-sm',
        SIZE_CLASS[size],
        className
      )}
      aria-hidden
    >
      <MysticServiceCardImage
        serviceId={serviceId}
        fill
        sizes={`(min-width: 768px) ${Math.round(px * 2)}px, ${Math.round(px * 1.5)}px`}
        testId={`service-thumb-${serviceId}`}
      />
    </div>
  );
}
