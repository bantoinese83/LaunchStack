import { BlastComposer } from './BlastComposer';

export default function StudioBlastsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium">Blasts</h2>
      <p className="mt-1 text-sm text-muted">Promos, out-of-town notices — Brevo + Twilio.</p>
      <div className="mt-6">
        <BlastComposer />
      </div>
    </div>
  );
}
