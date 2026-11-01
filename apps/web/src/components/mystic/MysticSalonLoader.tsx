import { MYSTIC_LOADING_COPY, type MysticLoadingCopyKey } from '@template/mystic';

type Props = {
  label?: string;
  copyKey?: MysticLoadingCopyKey;
  hideLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fill?: boolean;
};

const ringPx = { sm: 44, md: 56, lg: 68 } as const;
const iconPx = { sm: 18, md: 22, lg: 26 } as const;

function ScissorsIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8.12 8.12 20 20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.12 15.88 20 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScissorsSpinner({ size }: { size: keyof typeof ringPx }) {
  const box = ringPx[size];
  const icon = iconPx[size];

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center text-ink"
      style={{ width: box, height: box }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full animate-spin motion-reduce:animate-none"
        viewBox="0 0 48 48"
      >
        <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E0D6" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#7A8F6E"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="38 88"
        />
      </svg>
      <ScissorsIcon size={icon} />
    </div>
  );
}

export function MysticSalonLoader({
  label,
  copyKey,
  hideLabel = false,
  size = 'md',
  className = '',
  fill = false,
}: Props) {
  const caption = label ?? (copyKey ? MYSTIC_LOADING_COPY[copyKey] : MYSTIC_LOADING_COPY.default);

  const body = (
    <div
      role="status"
      aria-live="polite"
      aria-label={caption}
      className={`flex flex-col items-center gap-3 text-center ${className}`}
    >
      <ScissorsSpinner size={size} />
      {!hideLabel ? (
        <p className="type-hand-sm max-w-[14rem] text-muted motion-reduce:opacity-80">{caption}</p>
      ) : null}
    </div>
  );

  if (fill) {
    return <div className="flex min-h-[40vh] flex-1 items-center justify-center py-10">{body}</div>;
  }

  return body;
}
