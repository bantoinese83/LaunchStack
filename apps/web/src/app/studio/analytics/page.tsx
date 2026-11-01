import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { AnalyticsPanel } from './AnalyticsPanel';

export default function StudioAnalyticsPage() {
  return (
    <div>
      <MysticStudioPageHeader title="Analytics" />
      <MysticStudioSection>
        <AnalyticsPanel />
      </MysticStudioSection>
    </div>
  );
}
