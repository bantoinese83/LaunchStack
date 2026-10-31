import React from 'react';
import { MysticHeader } from './components/mystic/MysticHeader';
import { MysticHero } from './components/mystic/MysticHero';
import { MysticServices } from './components/mystic/MysticServices';
import { MysticPlans } from './components/mystic/MysticPlans';
import { MysticFooter } from './components/mystic/MysticFooter';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MysticHeader />
      <main>
        <MysticHero />
        <MysticServices />
        <MysticPlans />
      </main>
      <MysticFooter />
    </div>
  );
}
