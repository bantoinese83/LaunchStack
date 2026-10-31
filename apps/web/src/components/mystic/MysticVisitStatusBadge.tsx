import { visitStatusLabel, visitStatusTone, type VisitStatusTone } from '@template/mystic';

const toneClass: Record<VisitStatusTone, string> = {
  live: 'border-accent/50 bg-accent-soft text-accent',
  urgent: 'border-danger/40 bg-danger/10 text-danger animate-pulse motion-reduce:animate-none',
  active: 'border-shell/40 bg-gold-soft/80 text-plum',
  pending: 'border-line bg-paper text-muted',
  muted: 'border-line/80 bg-surface text-muted',
};

export function MysticVisitStatusBadge({ status }: { status: string }) {
  const tone = visitStatusTone(status);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      {visitStatusLabel(status)}
    </span>
  );
}
