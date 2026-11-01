import { Suspense } from 'react';
import { MysticSalonLoader } from '@/components/mystic/MysticSalonLoader';
import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { ThreadComposer } from './ThreadComposer';

export default function StudioMessagesPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Messages"
        description="Human-only chat — search clients, use quick replies, threads refresh automatically."
      />
      <MysticStudioSection>
        <Suspense fallback={<MysticSalonLoader copyKey="messages" className="py-8" />}>
          <ThreadComposer />
        </Suspense>
      </MysticStudioSection>
    </div>
  );
}
