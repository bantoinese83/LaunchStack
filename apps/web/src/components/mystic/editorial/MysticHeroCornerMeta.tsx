import { cn } from '@/lib/utils';

const CORNERS = [
  {
    id: 'format',
    pos: 'left-5 top-6 lg:left-8 lg:top-8',
    align: 'items-start text-left',
    kicker: 'Format',
    value: 'House call',
  },
  {
    id: 'area',
    pos: 'right-5 top-6 lg:right-8 lg:top-8',
    align: 'items-end text-right',
    kicker: 'Area',
    value: 'Chicago',
  },
  {
    id: 'menu',
    pos: 'bottom-6 left-5 lg:bottom-8 lg:left-8',
    align: 'items-start text-left',
    kicker: 'Menu',
    value: 'Blowouts · cuts · updos',
  },
  {
    id: 'book',
    pos: 'bottom-6 right-5 lg:bottom-8 lg:right-8',
    align: 'items-end text-right',
    kicker: 'Book',
    value: 'Online',
  },
] as const;

type Props = {
  className?: string;
};

/** ROSSI-style spread corners on the hero section frame. */
export function MysticHeroCornerMeta({ className }: Props) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-20 overflow-hidden', className)}
      aria-hidden
    >
      {CORNERS.map(({ id, pos, align, kicker, value }) => (
        <div
          key={id}
          className={cn(
            'absolute flex max-w-[11rem] flex-col uppercase sm:max-w-[12rem]',
            pos,
            align
          )}
        >
          <p className="font-sans text-[0.6875rem] font-medium tracking-[0.12em] text-muted">
            {kicker}
          </p>
          <p className="mt-0.5 font-sans text-[0.9375rem] font-medium leading-snug tracking-[0.06em] text-ink md:text-base">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
