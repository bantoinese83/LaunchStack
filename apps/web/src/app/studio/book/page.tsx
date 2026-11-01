import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioBookClientPanel } from './StudioBookClientPanel';

export default function StudioBookPage() {
  return (
    <div>
      <MysticStudioPageHeader
        eyebrow="Studio"
        title="Book for client"
        description="Phone or text booking — create the visit and send Stripe checkout."
      />
      <MysticStudioSection>
        <StudioBookClientPanel />
      </MysticStudioSection>
    </div>
  );
}
