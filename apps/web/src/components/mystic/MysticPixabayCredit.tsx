import attribution from '@/lib/mystic/marketing-attribution.json';

type AttributionFile = {
  source: string;
  items: { pageURL: string; user: string; role: string }[];
};

/** Required when displaying Pixabay-sourced photos in the UI. */
export function MysticPixabayCredit({ className = '' }: { className?: string }) {
  const data = attribution as AttributionFile;
  if (!data.items?.length) return null;

  const photographers = [...new Map(data.items.map((item) => [item.user, item])).values()];

  return (
    <p className={`text-[11px] leading-relaxed text-muted/80 ${className}`}>
      Photos from{' '}
      <a
        href="https://pixabay.com"
        target="_blank"
        rel="noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Pixabay
      </a>
      {photographers.map((item) => (
        <span key={item.pageURL}>
          {' · '}
          <a
            href={item.pageURL}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {item.user}
          </a>
        </span>
      ))}
    </p>
  );
}
