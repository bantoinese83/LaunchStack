/** Gold · plum · sage — 60s road-trip poster stripe (web). */
export function MysticRoadStripe({ className = '' }: { className?: string }) {
  return (
    <div className={`${className} flex h-[3px] overflow-hidden rounded-[1px]`} aria-hidden>
      <span className="flex-[5] bg-gold" />
      <span className="flex-[2] bg-plum" />
      <span className="flex-[3] bg-accent" />
    </div>
  );
}
