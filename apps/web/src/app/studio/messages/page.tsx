import { Suspense } from 'react';
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
        <Suspense fallback={<p className="text-sm text-muted">Loading messages…</p>}>
          <ThreadComposer />
        </Suspense>
      </MysticStudioSection>
    </div>
  );
}
