import React from 'react';
import { MarketingShell } from './MarketingShell';
import { MysticMarketingHeader } from '@/components/mystic/MysticMarketingHeader';
import { getVerifiedServerUser } from '@/lib/supabase/server';
import { MysticHero } from './components/mystic/MysticHero';
import { MysticServices } from './components/mystic/MysticServices';
import { MysticPlans } from './components/mystic/MysticPlans';
import { MysticFooter } from './components/mystic/MysticFooter';
import { MysticExperience } from './components/mystic/MysticExperience';

export default async function MarketingLandingPage() {
  const { userId } = await getVerifiedServerUser();

  return (
    <MarketingShell>
      <div className="min-h-screen bg-paper text-ink atlas-grain">
        <MysticMarketingHeader initialSignedIn={Boolean(userId)} />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <MysticHero />
          <MysticServices />
          <MysticExperience />
          <MysticPlans />
        </main>
        <MysticFooter initialSignedIn={Boolean(userId)} />
      </div>
    </MarketingShell>
  );
}
