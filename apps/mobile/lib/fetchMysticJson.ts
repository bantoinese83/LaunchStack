/** Consistent API responses for mobile → Mystic web backend. */
export type MysticFetchResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function fetchMysticJson<T extends Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<MysticFetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: 'Network error — check EXPO_PUBLIC_APP_URL and connection' } as unknown as T,
    };
  }
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = {
      error: res.ok ? 'Invalid response' : `Request failed (${res.status})`,
    } as unknown as T;
  }
  if (!res.ok && !('error' in data)) {
    data = { ...data, error: `Request failed (${res.status})` } as T;
  }
  return { ok: res.ok, status: res.status, data };
}
