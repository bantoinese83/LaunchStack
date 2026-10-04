import React from 'react';
import { MarketingHeader } from './components/MarketingHeader';
import { HeroSection } from './components/HeroSection';
import { TechStackMarquee } from './components/TechStackMarquee';
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
    <div className="min-h-screen bg-shell p-1.5 sm:p-2 md:p-3">
      <div className="marketing-stage flex min-h-[calc(100vh-12px)] flex-col overflow-hidden rounded-2xl bg-paper text-ink atlas-grain sm:min-h-[calc(100vh-16px)] md:rounded-[1.25rem]">
        <MarketingHeader />
        <HeroSection />
        <PlatformSection />
        <TechStackMarquee />
        <SurfacesSection />
        <PathSection />
        <IncludedSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
        <MarketingFooter />
      </div>
    </div>
  );
}
