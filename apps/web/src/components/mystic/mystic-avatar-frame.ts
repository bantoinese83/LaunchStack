import { cn } from '@/lib/utils';

/** Soft squircle + shield taper — shared Mystic avatar silhouette (not a plain circle). */
export const MYSTIC_AVATAR_FRAME = 'mystic-avatar-crest';

export function mysticAvatarFrameClass(className?: string) {
  return cn(
    MYSTIC_AVATAR_FRAME,
    'shrink-0 border border-line/80 bg-accent-soft object-cover shadow-[0_2px_10px_-4px_rgba(26,31,24,0.35)]',
    className
  );
}
