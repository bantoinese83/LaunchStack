import Image from 'next/image';

type Props = {
  url?: string | null;
  name?: string;
  size?: number;
  className?: string;
};

export function MysticUserAvatar({ url, name, size = 32, className = '' }: Props) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full border border-line/80 bg-accent-soft object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line/80 bg-accent-soft font-semibold text-accent ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
