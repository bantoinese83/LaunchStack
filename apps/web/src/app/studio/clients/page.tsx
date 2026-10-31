import { MysticStudioPageHeader } from '@/components/mystic/MysticStudioPageHeader';
import { MysticStudioSection } from '@/components/mystic/MysticStudioSection';
import { ClientsPanel } from './ClientsPanel';

export default function StudioClientsPage() {
  return (
    <div>
      <MysticStudioPageHeader
        title="Clients"
        description="Search clients, copy referral codes, view credits, and jump to messages."
      />
      <MysticStudioSection>
        <ClientsPanel />
      </MysticStudioSection>
    </div>
  );
}
