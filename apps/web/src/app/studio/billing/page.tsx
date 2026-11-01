import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioBillingPanel } from './StudioBillingPanel';

export default function StudioBillingPage() {
  return (
    <div>
      <MysticStudioPageHeader
        eyebrow="Studio"
        title="Memberships & billing"
        description="Subscription status and Stripe customer portal links."
      />
      <MysticStudioSection>
        <StudioBillingPanel />
      </MysticStudioSection>
    </div>
  );
}
