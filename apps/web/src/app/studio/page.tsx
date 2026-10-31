import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { StudioTodayLoader } from './components/StudioTodayLoader';

export default function StudioHomePage() {
  return (
    <section>
      <MysticStudioPageHeader eyebrow="Today" title="Operations" />
      <MysticStudioSection>
        <StudioTodayLoader />
      </MysticStudioSection>
    </section>
  );
}
