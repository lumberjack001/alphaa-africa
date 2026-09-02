"use client";

const API_BASE_URL = "https://api.alphaaafrica.com";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  phone?: string;
  phoneNumber?: string;
  is_verified: boolean;
}

export const getUserPhone = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return (
    user.phone_number ||
    user.phone ||
    user.phoneNumber ||
    user.mobile ||
    user.contact_phone ||
    user.phone_code ||
    user.profile?.phone_number ||
    user.profile?.phone ||
    ''
  );
};

// Helpers for token storage
export const getAccessToken = () => typeof window !== "undefined" ? localStorage.getItem("alphaa_access_token") : null;
export const getRefreshToken = () => typeof window !== "undefined" ? localStorage.getItem("alphaa_refresh_token") : null;
export const setTokens = (access: string, refresh: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("alphaa_access_token", access);
    localStorage.setItem("alphaa_refresh_token", refresh);
  }
};
export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("alphaa_access_token");
    localStorage.removeItem("alphaa_refresh_token");
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("alphaa_user");
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("alphaa_user", JSON.stringify(user));
  }
};

export const clearStoredUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("alphaa_user");
  }
};

/**
 * Safe wrapper around getStoredUser — catches JSON parse errors from corrupted localStorage.
 * Automatically clears corrupted data and returns null.
 */
export const safeGetStoredUser = (): User | null => {
  try {
    return getStoredUser();
  } catch {
    clearStoredUser();
    return null;
  }
};

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 * Use instead of inline `new Date().toISOString().split('T')[0]` which returns UTC.
 */
export const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.detail || data?.message || `API Error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

async function handleRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    if (data.access) {
      setTokens(data.access, data.refresh || refresh);
      return data.access;
    }
    return null;
  } catch (error) {
    // Do not proactively nuke tokens or stored user on refresh failure.
    // Session termination is strictly handled by:
    // 1. Idle timeout (14m + 1m countdown in useIdleTimer)
    // 2. Explicit manual sign-out (Navbar)
    // 3. Corrupted localStorage data (safeGetStoredUser)
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const access = getAccessToken();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    const isAuthEndpoint =
      endpoint.includes('/api/auth/login') ||
      endpoint.includes('/api/auth/token') ||
      endpoint.includes('/api/auth/register') ||
      endpoint.includes('/api/auth/password-reset') ||
      endpoint.includes('/api/auth/verify');

    if (!isAuthEndpoint) {
      // Queue requests while refreshing
      const retryPromise = new Promise<string | null>((resolve) => {
        refreshQueue.push((token) => resolve(token));
      });

      if (!isRefreshing) {
        isRefreshing = true;
        handleRefresh()
          .then((newAccess) => {
            isRefreshing = false;
            processQueue(newAccess);
          })
          .catch(() => {
            isRefreshing = false;
            processQueue(null);
          });
      }

      const refreshedToken = await retryPromise;
      if (refreshedToken) {
        headers.set("Authorization", `Bearer ${refreshedToken}`);
        response = await fetch(url, fetchOptions);
      } else {
        // Public endpoints (e.g. searching flights/hotels/cars/packages) can fall back to anonymous fetch
        const isPublicEndpoint =
          endpoint.includes('/api/flights/search') ||
          endpoint.includes('/api/flights/airports') ||
          endpoint.includes('/api/hotels') ||
          endpoint.includes('/api/cars') ||
          endpoint.includes('/api/packages') ||
          endpoint.includes('/api/visa/countries');

        if (isPublicEndpoint) {
          headers.delete("Authorization");
          response = await fetch(url, { ...options, headers });
        } else {
          throw new ApiError(401, { detail: "Authentication session expired. Please log in again." });
        }
      }
    }
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_) {
      // JSON parsing failed, use status text
    }
    console.error(`%c[API Fetch] Error response ${response.status} from: ${method} ${url}`, 'color: #FF4A4A; font-weight: bold;', errorData);
    throw new ApiError(response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (err) {
    console.error(`[API Fetch] Error parsing JSON response from: ${method} ${url}`, err);
    throw err;
  }
}

/**
 * Helper to recursively extract human-readable error messages from ApiError data.
 */
export function formatApiErrorMessage(error: any, fallbackMessage: string = "Request failed"): string {
  if (!(error instanceof ApiError) || !error.data) {
    return error?.message || fallbackMessage;
  }

  const data = error.data;
  if (typeof data === "string") return data;
  if (data.detail && typeof data.detail === "string") return data.detail;

  const messages: string[] = [];

  const extractRecursive = (obj: any, prefix = "") => {
    if (!obj) return;
    if (typeof obj === "string") {
      messages.push(prefix ? `${prefix}: ${obj}` : obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        if (typeof item === "string") {
          messages.push(prefix ? `${prefix}: ${item}` : item);
        } else if (typeof item === "object" && item !== null) {
          extractRecursive(item, prefix ? `${prefix} ${idx + 1}` : `Item ${idx + 1}`);
        }
      });
    } else if (typeof obj === "object") {
      Object.entries(obj).forEach(([key, val]) => {
        const cleanKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        const newPrefix = prefix ? `${prefix} -> ${cleanKey}` : cleanKey;
        extractRecursive(val, newPrefix);
      });
    }
  };

  extractRecursive(data);
  return messages.length > 0 ? messages.join(" • ") : fallbackMessage;
}

/**
 * Safe wrapper around formatApiErrorMessage — catches RangeError (stack overflow)
 * from malicious or deeply-nested API error response objects.
 */
export function safeFormatApiErrorMessage(error: any, fallbackMessage: string = "Request failed"): string {
  try {
    return formatApiErrorMessage(error, fallbackMessage);
  } catch {
    return error?.message || fallbackMessage;
  }
}
