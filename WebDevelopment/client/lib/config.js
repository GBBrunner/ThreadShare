// Centralized client-side configuration

// Prefer NEXT_PUBLIC_ for client-side env exposure; fall back if needed.
// Keep the default pointed at the local server for dev.
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_RENDER_SERVER_URL ||
  process.env.NEXT_PUBLIC_GARRETTS_RENDER_SERVER_URL ||
  process.env.RENDER_SERVER_URL ||
  'http://localhost:3005';

/**
 * Returns common fetch headers including the stored JWT for authentication.
 * Use this for any API request that requires the user to be signed in.
 */
export function getAuthHeaders(extra = {}) {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('jwt'))
    : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/**
 * Authenticated fetch wrapper. Behaves exactly like fetch() but automatically
 * signs the user out and redirects to /login if the server returns 401.
 */
export async function fetchWithAuth(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:signout'));
  }
  return res;
}
