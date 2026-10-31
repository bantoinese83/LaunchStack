/** Default house-call hours (local Chicago — studio can override later). */
export const DEFAULT_STUDIO_HOURS = {
  startHour: 9,
  endHour: 20,
  slotMinutes: 30,
} as const;

export function buildTimeSlotsForDate(
  dateIso: string,
  durationMinutes: number,
  bufferMinutes: number,
  bookedStarts: Date[]
): string[] {
  const day = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(day.getTime())) return [];

  const slots: string[] = [];
  const start = new Date(day);
  start.setHours(DEFAULT_STUDIO_HOURS.startHour, 0, 0, 0);
  const end = new Date(day);
  end.setHours(DEFAULT_STUDIO_HOURS.endHour, 0, 0, 0);

  for (
    let cursor = start.getTime();
    cursor + durationMinutes * 60_000 + bufferMinutes * 60_000 <= end.getTime();
    cursor += DEFAULT_STUDIO_HOURS.slotMinutes * 60_000
  ) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor + durationMinutes * 60_000);
    const overlaps = bookedStarts.some((booked) => {
      const bookedEnd = new Date(booked.getTime() + 60 * 60_000);
      return slotStart < bookedEnd && slotEnd > booked;
    });
    if (!overlaps) {
      slots.push(
        slotStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    }
  }
  return slots;
}
