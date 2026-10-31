import { MYSTIC_STYLIST } from '@template/mystic';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';

type Props = {
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export function MysticStylistChip({ size = 26, showLabel = true, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MysticUserAvatar url={MYSTIC_STYLIST.portraitPath} name={MYSTIC_STYLIST.name} size={size} />
      {showLabel ? (
        <span className="text-xs text-muted">
          <span className="font-medium text-ink">{MYSTIC_STYLIST.name}</span>
          <span className="text-muted"> · your stylist</span>
        </span>
      ) : null}
    </span>
  );
}
