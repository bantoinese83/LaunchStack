import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES } from '@template/mystic';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticPricingTiers } from '@/components/mystic/MysticPricingTiers';
import { mysticEyebrow, mysticSectionTitle } from './mystic-styles';

export function MysticPlans() {
  return (
    <section id="memberships" className="border-t border-line/50 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className={mysticEyebrow}>Glow & Luxe</p>
        <h2 className={`${mysticSectionTitle} mt-3`}>Memberships & packages</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Monthly Glow & Luxe memberships and prepaid blowout packages — house-call only, with
          travel and evening surcharges waived for members.
        </p>

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
