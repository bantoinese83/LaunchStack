import { MYSTIC_STYLIST } from '@template/mystic';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';

type Props = {
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export function MysticStylistChip({ size = 34, showLabel = true, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MysticUserAvatar url={MYSTIC_STYLIST.avatarPath} name={MYSTIC_STYLIST.name} size={size} />
      {showLabel ? (
        <span className="text-sm text-muted">
          <span className="type-hand-md text-ink">{MYSTIC_STYLIST.name}</span>
          <span className="type-hand-sm font-medium text-plum"> · your stylist</span>
        </span>
      ) : null}
    </span>
  );
}
