import React from 'react';
import { MarketingShell } from './MarketingShell';
import { MysticMarketingHeader } from '@/components/mystic/MysticMarketingHeader';
import { MysticHero } from './components/mystic/MysticHero';
import { MysticServices } from './components/mystic/MysticServices';
import { MysticPlans } from './components/mystic/MysticPlans';
import { MysticFooter } from './components/mystic/MysticFooter';
import { MysticExperience } from './components/mystic/MysticExperience';

export default function MarketingLandingPage() {
  return (
    <MarketingShell>
      <div className="min-h-screen bg-paper text-ink atlas-grain">
        <MysticMarketingHeader />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <MysticHero />
          <MysticServices />
          <MysticExperience />
          <MysticPlans />
        </main>
        <MysticFooter />
      </div>
    </MarketingShell>
  );
}
