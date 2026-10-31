import type { ReactNode } from 'react';
import {
  mysticPageEnter,
  mysticPageStack,
  mysticPageStackLoose,
} from '@/components/mystic/mystic-styles';

type Width = 'narrow' | 'wide';

const widthClass: Record<Width, string> = {
  narrow: 'max-w-lg',
  wide: 'max-w-5xl',
};

type Props = {
  children: ReactNode;
  width?: Width;
  className?: string;
  /** Looser vertical gap (shop, memberships) */
  loose?: boolean;
  /** Skip entrance animation (nested inside another animated shell) */
  noEnter?: boolean;
};

export function MysticClientPage({
  children,
  width = 'narrow',
  className = '',
  loose = false,
  noEnter = false,
}: Props) {
  const stack = loose ? mysticPageStackLoose : mysticPageStack;
  return (
    <div
      className={`mx-auto w-full ${widthClass[width]} ${stack} pb-2 md:pb-4 ${noEnter ? '' : mysticPageEnter} ${className}`}
    >
      {children}
    </div>
  );
}
