// Centralized client-side configuration

// Prefer NEXT_PUBLIC_ for client-side env exposure; fall back if needed
// Supports both generic SERVER_URL and legacy RENDER_SERVER_URL variable names
export const SERVER_URL =
  process.env.NEXT_PUBLIC_GARRETTS_RENDER_SERVER_URL ||
  // process.env.NEXT_PUBLIC_SERVER_URL ||
  // process.env.NEXT_PUBLIC_RENDER_SERVER_URL ||
  // process.env.RENDER_SERVER_URL ||
  'http://localhost:3005';

/**
 * Returns common fetch headers including the stored JWT for authentication.
 * Use this for any API request that requires the user to be signed in.
 */
export function getAuthHeaders(extra = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
