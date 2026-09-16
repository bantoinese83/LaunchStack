import React from 'react';
import { MarketingHeader } from './components/MarketingHeader';
import { HeroSection } from './components/HeroSection';
import { PlatformSection } from './components/PlatformSection';
import { SurfacesSection } from './components/SurfacesSection';
import { PathSection } from './components/PathSection';
import { IncludedSection } from './components/IncludedSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { CtaSection } from './components/CtaSection';
import { MarketingFooter } from './components/MarketingFooter';

export default function MarketingLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink atlas-grain">
      <MarketingHeader />
      <HeroSection />
      <PlatformSection />
      <SurfacesSection />
      <PathSection />
      <IncludedSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <MarketingFooter />
    </div>
  );
}
