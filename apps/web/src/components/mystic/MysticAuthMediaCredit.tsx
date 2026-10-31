import attribution from '@/lib/mystic/marketing-attribution.json';

type Item = { pageURL: string; user: string; role: string };

/** Pixabay credit for auth background video (when attribution includes auth_video). */
export function MysticAuthMediaCredit() {
  const items = (attribution as { items?: Item[] }).items ?? [];
  const video = items.find((i) => i.role === 'auth_video');
  if (!video) return null;

  return (
    <p className="pointer-events-auto fixed bottom-3 left-0 right-0 z-20 text-center text-[10px] text-paper/45">
      Background video from{' '}
      <a
        href="https://pixabay.com"
        target="_blank"
        rel="noreferrer"
        className="underline-offset-2 hover:text-paper/70 hover:underline"
      >
        Pixabay
      </a>
      {' · '}
      <a
        href={video.pageURL}
        target="_blank"
        rel="noreferrer"
        className="underline-offset-2 hover:text-paper/70 hover:underline"
      >
        {video.user}
      </a>
    </p>
  );
}
