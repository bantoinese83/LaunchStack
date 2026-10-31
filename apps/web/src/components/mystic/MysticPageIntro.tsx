type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function MysticPageIntro({ eyebrow, title, description, className = '' }: Props) {
  return (
    <header className={`max-w-2xl ${className}`}>
      {eyebrow ? <p className="type-eyebrow text-accent">{eyebrow}</p> : null}
      <h1 className="font-display mt-2 text-3xl font-medium tracking-tight text-ink md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  );
}
