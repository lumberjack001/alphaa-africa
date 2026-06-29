"use client";

const API_BASE_URL = "https://api.alphaaafrica.com";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_verified: boolean;
}

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
      setTokens(data.access, refresh);
      return data.access;
    }
    return null;
  } catch (error) {
    clearTokens();
    clearStoredUser();
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  
  console.log(`%c[API Fetch] Initiating ${method} request to: ${url}`, 'color: #FA6432; font-weight: bold; font-size: 10px;');
  if (options.body) {
    try {
      console.log('[API Fetch] Request Payload:', JSON.parse(options.body as string));
    } catch (_) {
      console.log('[API Fetch] Request Payload:', options.body);
    }
  }

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
    console.warn(`[API Fetch] 401 Unauthorized detected on ${method} ${url}. Attempting token refresh...`);
    // Attempt token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccess = await handleRefresh();
        if (newAccess) {
          isRefreshing = false;
          processQueue(newAccess);
        } else {
          isRefreshing = false;
          processQueue(null);
        }
      } catch (err) {
        isRefreshing = false;
        processQueue(null);
      }
    }

    // Queue requests while refreshing
    const retryPromise = new Promise<string | null>((resolve) => {
      refreshQueue.push((token) => resolve(token));
    });

    const refreshedToken = await retryPromise;
    if (refreshedToken) {
      console.log(`[API Fetch] Token refreshed. Retrying ${method} request to: ${url}...`);
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, fetchOptions);
    } else {
      console.error(`[API Fetch] Token refresh failed. Ending session.`);
      // Redirect or reject
      throw new ApiError(401, { detail: "Authentication session expired. Please log in again." });
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
    console.log(`%c[API Fetch] Success 204 No Content response from: ${method} ${url}`, 'color: #3EC193; font-weight: bold;');
    return {} as T;
  }

  try {
    const data = await response.json();
    console.log(`%c[API Fetch] Success response from: ${method} ${url} - Data:`, 'color: #3EC193; font-weight: bold;', data);
    return data as T;
  } catch (err) {
    console.error(`[API Fetch] Error parsing JSON response from: ${method} ${url}`, err);
    throw err;
  }
}
