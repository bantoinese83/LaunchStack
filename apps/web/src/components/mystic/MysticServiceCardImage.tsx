import Image from 'next/image';
import { MYSTIC_SERVICE_CARD_IMAGE_PATH, type ServiceId } from '@template/mystic';
import { cn } from '@/lib/utils';

/** Local JPGs are already ~1024px — skip re-encode so thumbs stay crisp on retina. */
const SERVICE_CARD_UNOPTIMIZED = true;
const SERVICE_CARD_QUALITY = 92;

type FillProps = {
  serviceId: ServiceId;
  fill: true;
  className?: string;
  sizes: string;
  priority?: boolean;
  testId?: string;
};

type FixedProps = {
  serviceId: ServiceId;
  fill?: false;
  width: number;
  height: number;
  className?: string;
  sizes: string;
  priority?: boolean;
  testId?: string;
};

type Props = FillProps | FixedProps;

export function MysticServiceCardImage(props: Props) {
  const src = MYSTIC_SERVICE_CARD_IMAGE_PATH[props.serviceId];
  const shared = {
    src,
    alt: '' as const,
    quality: SERVICE_CARD_QUALITY,
    unoptimized: SERVICE_CARD_UNOPTIMIZED,
    className: cn('object-cover object-[center_32%]', props.className),
    'data-testid': props.testId,
    priority: props.priority,
  };

  if (props.fill) {
    return <Image {...shared} alt="" fill sizes={props.sizes} />;
  }

  return <Image {...shared} alt="" width={props.width} height={props.height} sizes={props.sizes} />;
}
