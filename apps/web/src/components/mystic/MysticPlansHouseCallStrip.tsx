import { MYSTIC_STYLIST } from '@template/mystic';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { MysticMarketingPhoto } from '@/components/mystic/MysticMarketingPhoto';

/** Editorial beat — Luke in action before the plan catalog. */
export function MysticPlansHouseCallStrip() {
  return (
    <section
      className="mt-10 overflow-hidden rounded-2xl border border-line/60 bg-surface shadow-[0_22px_55px_-38px_rgba(26,31,24,0.4)]"
      aria-label="House-call styling"
    >
      <div className="grid md:grid-cols-[minmax(0,13rem)_1fr] md:items-stretch">
        <div className="relative aspect-[3/4] w-full max-h-[22rem] md:max-h-none md:min-h-[13rem]">
          <MysticMarketingPhoto
            src={MYSTIC_MARKETING_IMAGES.stylistHeroScenes[2]!}
            alt={`${MYSTIC_STYLIST.name} finishing a blowout on a house call`}
            crop="portrait"
            sizes="(min-width: 768px) 208px, 100vw"
            className="absolute inset-0"
            priority
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface/20 via-transparent to-surface/30 md:bg-gradient-to-t md:from-surface/10 md:via-transparent md:to-surface/40"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-7 md:px-8 md:py-9">
          <p className="type-eyebrow text-plum">Same visit as booking</p>
          <p className="font-display mt-2 text-xl leading-snug text-ink md:text-2xl">
            Credits cover pro styling at your door — hot tools, travel, and evening fees waived on
            plan visits.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Pick Glow or Luxe monthly, or prepaid packs below. Everything applies automatically at
            checkout.
          </p>
        </div>
      </div>
    </section>
  );
}
