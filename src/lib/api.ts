/**
 * Thin fetch wrapper for the StudyWise Express + PostgreSQL backend.
 *
 * Base URL: VITE_API_URL (defaults to http://localhost:5000/api).
 * Auth: JWT access token attached automatically from localStorage when present.
 *       (The token itself is required client-side storage — every JWT SPA does
 *       this; it's not the app-state persistence we've removed.)
 */

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "StudyWise.token.v1";
const REFRESH_KEY = "StudyWise.refresh.v1";

export const tokenStore = {
  get access(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string | null) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export async function api<T = any>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = tokenStore.access;
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (e: any) {
    throw new ApiError(0, e?.message || "Network error");
  }

  if (res.status === 204) return undefined as T;

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = { message: text }; }
  }

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return payload as T;
}