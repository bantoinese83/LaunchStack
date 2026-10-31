import type { ReactNode } from 'react';
import { mysticCard } from './mystic-styles';

type Props = {
  children: ReactNode;
  className?: string;
};

export function MysticAuthCard({ children, className = '' }: Props) {
  return (
    <div
      className={`${mysticCard} w-full border-line/60 bg-surface p-8 shadow-[0_32px_80px_-48px_rgba(26,31,24,0.55)] ${className}`}
    >
      {children}
    </div>
  );
}
