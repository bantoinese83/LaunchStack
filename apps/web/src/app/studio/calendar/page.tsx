import { StudioCalendar } from './StudioCalendar';

export default function StudioCalendarPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium">Calendar</h2>
      <p className="mt-1 text-sm text-muted">Next 7 days of house calls.</p>
      <div className="mt-6">
        <StudioCalendar />
      </div>
    </div>
  );
}
