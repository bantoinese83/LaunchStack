import { ThreadComposer } from './ThreadComposer';

export default function StudioMessagesPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium">Messages</h2>
      <p className="mt-1 text-sm text-muted">Human-only chat — no AI bot.</p>
      <div className="mt-6">
        <ThreadComposer />
      </div>
    </div>
  );
}
