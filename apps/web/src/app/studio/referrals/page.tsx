import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { ReferralsPanel } from './ReferralsPanel';

export default function StudioReferralsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Referrals"
        description="Track who referred whom and issued credits."
      />
      <MysticStudioSection>
        <ReferralsPanel />
      </MysticStudioSection>
    </div>
  );
}
