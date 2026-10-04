export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers, credentials: 'include' });
}
