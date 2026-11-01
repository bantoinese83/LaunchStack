import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { BlockedDatesPanel } from './BlockedDatesPanel';
import { SettingsForm } from './SettingsForm';
import { StudioSchedulingPanel } from './StudioSchedulingPanel';
import { StudioBlockedIntervalsPanel } from './StudioBlockedIntervalsPanel';
import { StudioMenuPanel } from './StudioMenuPanel';

export default function StudioSettingsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        eyebrow="Studio"
        title="Settings"
        description="Hours, menu, buffers, deposits, surcharges, and blocked dates."
      />
      <MysticStudioSection className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-8">
          <SettingsForm />
          <StudioSchedulingPanel />
          <StudioMenuPanel />
        </div>
        <div className="space-y-8">
          <BlockedDatesPanel />
          <StudioBlockedIntervalsPanel />
        </div>
      </MysticStudioSection>
    </div>
  );
}
