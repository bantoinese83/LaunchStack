import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Tinder-style oversized footer wordmark — static type, no video. */
export function MysticFooterBlockWordmark({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative flex w-full items-end justify-center overflow-visible pt-4 pb-2 select-none md:pt-5 md:pb-3',
        className
      )}
    >
      <p className="mystic-footer-block-wordmark">MYSTIC HAIR</p>
    </div>
  );
}
