import { ClientsPanel } from './ClientsPanel';

export default function StudioClientsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Clients</h1>
      <p className="mt-1 text-sm text-muted">Profiles, referral codes, blowout credits.</p>
      <ClientsPanel />
    </div>
  );
}
