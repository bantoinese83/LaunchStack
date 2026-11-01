import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioCalendar } from './StudioCalendar';

export default function StudioCalendarPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Calendar"
        description="Month grid or day timeline — tap a visit to manage it."
      />
      <MysticStudioSection>
        <StudioCalendar />
      </MysticStudioSection>
    </div>
  );
}
