import Image from 'next/image';
import { mysticAvatarFrameClass } from '@/components/mystic/mystic-avatar-frame';

type Props = {
  url?: string | null;
  name?: string;
  size?: number;
  className?: string;
};

export function MysticUserAvatar({ url, name, size = 40, className = '' }: Props) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const frame = mysticAvatarFrameClass(className);

  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className={frame}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-accent ${frame}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
