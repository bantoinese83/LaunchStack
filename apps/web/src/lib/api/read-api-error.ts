/** Reads `{ error: string }` JSON bodies from failed API responses. */
export async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? fallback;
}
