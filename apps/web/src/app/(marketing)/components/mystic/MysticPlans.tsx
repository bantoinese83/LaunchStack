import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES } from '@template/mystic';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticPricingTiers } from '@/components/mystic/MysticPricingTiers';
import { MysticMarketingSectionHead } from '@/components/mystic/editorial/MysticMarketingSectionHead';

export function MysticPlans() {
  return (
    <section
      id="memberships"
      className="mystic-marketing-section mystic-marketing-section--defer border-t border-line/50 px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <MysticMarketingSectionHead
          handLabel="Member perks"
          eyebrow="Glow & Luxe"
          title="Memberships & packages"
          description="Monthly Glow & Luxe memberships and prepaid blowout packages — house-call only, with travel and evening surcharges waived for members."
        />

        <div className="mt-14">
          <MysticPricingTiers memberships={MYSTIC_MEMBERSHIPS} packages={MYSTIC_PACKAGES} />
        </div>

        <div className="mt-14">
          <MysticMagneticLink href="/book">Start booking</MysticMagneticLink>
        </div>
      </div>
    </section>
  );
}
