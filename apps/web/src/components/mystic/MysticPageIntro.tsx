import { MysticRoadStripe } from '@/components/mystic/MysticRoadStripe';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  /** Match studio header scale (book flow) */
  size?: 'default' | 'compact';
};

export function MysticPageIntro({
  eyebrow,
  title,
  description,
  className = '',
  size = 'default',
}: Props) {
  const titleClass =
    size === 'compact'
      ? 'font-display mt-1.5 text-2xl font-medium tracking-tight text-ink md:text-3xl'
      : 'font-display mt-1.5 text-3xl font-medium tracking-tight text-ink md:text-4xl';

  return (
    <header className={`w-full max-w-2xl ${className}`}>
      <MysticRoadStripe className="mb-4 max-w-xs" />
      {eyebrow ? <p className="type-eyebrow text-plum">{eyebrow}</p> : null}
      <h1 className={titleClass}>{title}</h1>
      {description ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
