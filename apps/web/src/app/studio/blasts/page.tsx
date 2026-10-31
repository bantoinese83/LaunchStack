import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { BlastComposer } from './BlastComposer';

export default function StudioBlastsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Blasts"
        description="Promos and out-of-town notices — Brevo email + Twilio SMS."
      />
      <MysticStudioSection>
        <BlastComposer />
      </MysticStudioSection>
    </div>
  );
}
