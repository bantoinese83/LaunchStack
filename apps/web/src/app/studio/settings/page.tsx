import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { BlockedDatesPanel } from './BlockedDatesPanel';
import { SettingsForm } from './SettingsForm';

export default function StudioSettingsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        eyebrow="Studio"
        title="Settings"
        description="Buffers, deposits, surcharges, and blocked dates."
      />
      <MysticStudioSection className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <SettingsForm />
        <BlockedDatesPanel />
      </MysticStudioSection>
    </div>
  );
}
