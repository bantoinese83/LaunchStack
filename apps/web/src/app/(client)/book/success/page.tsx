import { BookSuccessClient } from './BookSuccessClient';
import { loadBookSuccessAppointment } from '@/lib/mystic/load-book-success';

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; appointment_id?: string }>;
}) {
  const params = await searchParams;
  const appointment = await loadBookSuccessAppointment({
    appointmentId: params.appointment_id,
    sessionId: params.session_id,
  });

  const refShort = appointment?.id.slice(0, 8) ?? params.appointment_id?.slice(0, 8);

  return <BookSuccessClient appointment={appointment} refShort={refShort} />;
}
