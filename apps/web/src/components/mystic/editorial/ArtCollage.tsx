import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  primaryImage: string;
  secondaryImage: string;
  primaryAlt?: string;
  secondaryAlt?: string;
  className?: string;
};

/** Layered editorial photo pair — 21st Hero-04 collage pattern. */
export function ArtCollage({
  primaryImage,
  secondaryImage,
  primaryAlt = '',
  secondaryAlt = '',
  className,
}: Props) {
  return (
    <div className={cn('relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none', className)}>
      <div
        className="absolute right-0 top-[6%] z-10 w-[72%] overflow-hidden rounded-[1.75rem] shadow-[0_28px_60px_-28px_rgba(26,31,24,0.45)] ring-1 ring-line/40"
        style={{ transform: 'rotate(2deg)' }}
      >
        <Image
          src={primaryImage}
          alt={primaryAlt}
          width={640}
          height={800}
          className="aspect-[4/5] w-full object-cover"
          sizes="(max-width:1024px) 72vw, 340px"
          priority
        />
      </div>
      <div
        className="absolute bottom-0 left-0 z-20 w-[62%] overflow-hidden rounded-[1.5rem] shadow-[0_24px_50px_-24px_rgba(26,31,24,0.5)] ring-1 ring-gold/30"
        style={{ transform: 'rotate(-3deg)' }}
      >
        <Image
          src={secondaryImage}
          alt={secondaryAlt}
          width={520}
          height={640}
          className="aspect-[4/5] w-full object-cover"
          sizes="(max-width:1024px) 62vw, 280px"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-[10%] -z-10 rounded-full bg-gradient-to-br from-accent-soft/50 via-gold-soft/40 to-transparent blur-3xl"
      />
    </div>
  );
}
