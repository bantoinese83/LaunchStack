import type { ReactNode } from 'react';
import { mysticPageStack } from '@/components/mystic/mystic-styles';

/** Spacing below studio page headers */
export function MysticStudioSection({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const isGrid = className.includes('grid');
  return (
    <div className={`mt-5 md:mt-6 ${isGrid ? '' : mysticPageStack} ${className}`.trim()}>
      {children}
    </div>
  );
}
