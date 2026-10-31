import { mysticCard } from '@/components/mystic/mystic-styles';

export function StudioLoadingRows({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${mysticCard} h-20 animate-pulse`} />
      ))}
    </ul>
  );
}
