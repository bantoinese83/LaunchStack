import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioCalendar } from './StudioCalendar';

export default function StudioCalendarPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Calendar"
        description="Next 7 days — reschedule, cancel, or message clients from each visit."
      />
      <MysticStudioSection>
        <StudioCalendar />
      </MysticStudioSection>
    </div>
  );
}
