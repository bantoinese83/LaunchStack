import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioPromotionsPanel } from './StudioPromotionsPanel';

export default function StudioPromotionsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        eyebrow="Studio"
        title="Promotions"
        description="Checkout promo codes — mention them in blasts when you run a sale."
      />
      <MysticStudioSection>
        <StudioPromotionsPanel />
      </MysticStudioSection>
    </div>
  );
}
