'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';

type Props = {
  variant: 'hero' | 'stylist';
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

/** Uses downloaded Pixabay assets when present; falls back to brand logo. */
export function MysticMarketingImage({
  variant,
  alt,
  className = '',
  priority,
  fill,
  sizes,
  width,
  height,
}: Props) {
  const preferred =
    variant === 'hero' ? MYSTIC_MARKETING_IMAGES.hero : MYSTIC_MARKETING_IMAGES.stylist;
  const [src, setSrc] = useState<string>(preferred);

  const shared = {
    alt,
    className,
    priority,
    onError: () => setSrc(MYSTIC_MARKETING_IMAGES.logo),
  };

  if (fill) {
    return <Image {...shared} alt={alt} src={src} fill sizes={sizes ?? '100vw'} />;
  }

  return (
    <Image
      {...shared}
      alt={alt}
      src={src}
      width={width ?? 640}
      height={height ?? 640}
      sizes={sizes}
      style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
    />
  );
}
