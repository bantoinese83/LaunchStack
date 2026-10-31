export async function uploadInspoPhotosForAppointment(
  appointmentId: string,
  files: File[]
): Promise<{ uploaded: number; errors: string[] }> {
  const errors: string[] = [];
  let uploaded = 0;

  for (const file of files.slice(0, 4)) {
    const form = new FormData();
    form.set('appointmentId', appointmentId);
    form.set('file', file);
    const res = await fetch('/api/mystic/appointments/inspo', { method: 'POST', body: form });
    if (res.ok) uploaded += 1;
    else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      errors.push(data.error ?? `Upload failed (${res.status})`);
    }
  }

  return { uploaded, errors };
}
