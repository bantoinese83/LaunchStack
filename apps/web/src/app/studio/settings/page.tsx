import { BlockedDatesPanel } from './BlockedDatesPanel';
import { SettingsForm } from './SettingsForm';

export default function StudioSettingsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium">Studio settings</h2>
      <p className="mt-1 text-sm text-muted">Buffers, deposits, surcharges.</p>
      <div className="mt-6">
        <SettingsForm />
        <BlockedDatesPanel />
      </div>
    </div>
  );
}
