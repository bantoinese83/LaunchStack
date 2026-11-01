/** Read a multipart `file` field from browser or React Native FormData. */
export async function readMultipartFile(
  form: FormData,
  field = 'file'
): Promise<{ data: Buffer; name: string; type: string; size: number } | null> {
  const entry = form.get(field);
  if (!entry || typeof entry === 'string') return null;
  if (!(entry instanceof Blob)) return null;

  const data = Buffer.from(await entry.arrayBuffer());
  const fileName = entry instanceof File && entry.name ? entry.name : 'upload.jpg';

  return {
    data,
    name: fileName,
    type: entry.type || 'application/octet-stream',
    size: data.length,
  };
}
