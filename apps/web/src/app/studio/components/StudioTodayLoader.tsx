'use client';

import { useEffect, useState } from 'react';
import { getMysticWorkspaceId } from '@/lib/mystic/config';
import { StudioOpsPanel } from './StudioOpsPanel';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
};

export function StudioTodayLoader() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const workspaceId = getMysticWorkspaceId();
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    void fetch(
      `/api/mystic/appointments?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments ?? []))
      .catch(() => setAppointments([]));
  }, []);

  return <StudioOpsPanel initialAppointments={appointments} />;
}
