import type { MysticLoadingCopyKey } from '@template/mystic';
import { mysticCard } from '@/components/mystic/mystic-styles';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';

export function StudioLoadingRows({
  count = 3,
  copyKey = 'studio',
}: {
  count?: number;
  copyKey?: MysticLoadingCopyKey;
}) {
  return (
    <div className="space-y-6" aria-busy="true">
      <MysticSalonLoader copyKey={copyKey} size="sm" />
      <ul className="space-y-3" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={`${mysticCard} h-20 animate-pulse`} />
        ))}
      </ul>
    </div>
  );
}
