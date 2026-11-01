import Image from 'next/image';
import { cn } from '@/lib/utils';

/** How to crop marketing photography in fixed aspect boxes. */
export type MysticMarketingPhotoCrop = 'salon' | 'portrait' | 'fit';

type Props = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
  /** Portrait Luke heroes (864×1152) — anchor from top so heads stay in frame. */
  crop?: MysticMarketingPhotoCrop;
};

const CROP_CLASS: Record<MysticMarketingPhotoCrop, string> = {
  salon: 'object-cover object-[center_32%]',
  portrait: 'object-cover object-top',
  /** Full frame visible (head + hands) — matches 864×1152 heroes in a 3:4 box. */
  fit: 'object-contain object-center',
};

/** Local marketing JPG/PNG — serve originals for crisp downsizing. */
export function MysticMarketingPhoto({
  src,
  alt,
  className,
  imageClassName,
  sizes,
  priority,
  crop = 'salon',
}: Props) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={92}
        unoptimized
        className={cn(CROP_CLASS[crop], imageClassName)}
      />
    </div>
  );
}
