import { MYSTIC_BRAND, MYSTIC_SERVICES, type ServiceId } from '@template/mystic';

export type BookSuccessCalendarInput = {
  serviceId: string;
  startsAt: string;
  durationMinutes: number;
  addressLine: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** UTC stamp for Google Calendar `dates` param (YYYYMMDDTHHMMSSZ). */
export function toGoogleCalendarUtc(iso: string) {
  const d = new Date(iso);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcs(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildCalendarLinks(input: BookSuccessCalendarInput) {
  const service =
    MYSTIC_SERVICES.find((s) => s.id === (input.serviceId as ServiceId))?.name ??
    'Mystic Hair appointment';
  const start = new Date(input.startsAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const title = `${service} — ${MYSTIC_BRAND.name}`;
  const details = `House call with Luke. Questions? Message Luke in the app or DM ${MYSTIC_BRAND.instagram}.`;
  const location = input.addressLine;

  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', title);
  googleUrl.searchParams.set(
    'dates',
    `${toGoogleCalendarUtc(start.toISOString())}/${toGoogleCalendarUtc(end.toISOString())}`
  );
  googleUrl.searchParams.set('details', details);
  googleUrl.searchParams.set('location', location);

  const uid = `${start.getTime()}@mystichair.co`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mystic Hair Co//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toGoogleCalendarUtc(new Date().toISOString())}`,
    `DTSTART:${toGoogleCalendarUtc(start.toISOString())}`,
    `DTEND:${toGoogleCalendarUtc(end.toISOString())}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    googleUrl: googleUrl.toString(),
    icsDataUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
    icsFilename: 'mystic-hair-appointment.ics',
  };
}
