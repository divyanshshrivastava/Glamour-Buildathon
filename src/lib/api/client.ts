/**
 * Shared API client for communicating with the Glamour backend.
 *
 * The backend runs on http://localhost:5000 and every endpoint
 * lives under /api/v1.  All JSON responses follow the envelope
 * { status: 'success', data: T, ... }.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
  status: string;
  data: T;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Thin wrapper around fetch that:
 *  – prepends the base URL
 *  – throws on non-2xx
 *  – unwraps the `data` field from the response envelope
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
    // Prevent Next.js from caching API calls during SSR by default,
    // so pages always show fresh data from the backend.
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText} – ${path}: ${body}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export async function apiFetchWithAuth<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText} – ${path}: ${body}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export { API_BASE_URL };
