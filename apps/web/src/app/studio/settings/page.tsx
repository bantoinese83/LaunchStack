import { BlockedDatesPanel } from './BlockedDatesPanel';
import { SettingsForm } from './SettingsForm';

export default function StudioSettingsPage() {
  return (
    <div>
      <p className="type-eyebrow text-accent">Studio</p>
      <h2 className="font-display mt-2 text-2xl font-medium tracking-tight">Settings</h2>
      <p className="mt-1 text-sm text-muted">Buffers, deposits, surcharges, and blocked dates.</p>
      <div className="mt-6">
        <SettingsForm />
        <BlockedDatesPanel />
      </div>
    </div>
  );
}
