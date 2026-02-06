// Base API client with error handling and cookie-based authentication

import { ApiError } from '@/src/shared/types/api';
import { storage } from '@/src/shared/lib/storage';
import { ENV } from '@/src/shared/config/env';
import { toast } from 'sonner';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  _isRetry?: boolean;
}

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // If already refreshing, wait for the existing promise
  if (isRefreshing && refreshPromise) {
    const response = await refreshPromise;
    return response.ok;
  }

  isRefreshing = true;
  refreshPromise = fetch(`${ENV.AUTH_SERVICE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const response = await refreshPromise;
    return response.ok;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

function handleAuthFailure(): void {
  storage.clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const errorMessage = error.message || `HTTP ${response.status}`;

    // Don't show toast for 401 errors (will be handled by retry logic)
    if (response.status !== 401) {
      toast.error(errorMessage);
    }

    throw {
      status: response.status,
      message: errorMessage,
      code: error.code,
    } as ApiError;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function getHeaders(options: RequestOptions, tenantSlug?: string): HeadersInit {
  const slug = tenantSlug ?? storage.getTenantSlug();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (slug) {
    (headers as Record<string, string>)['X-Tenant-Slug'] = slug;
  }

  return headers;
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
  tenantSlug?: string
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies
    headers: getHeaders(options, tenantSlug),
  });

  // Handle 401 with token refresh
  if (response.status === 401 && !options._isRetry && !options.skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request
      return apiRequest<T>(url, { ...options, _isRetry: true }, tenantSlug);
    } else {
      handleAuthFailure();
      throw {
        status: 401,
        message: 'Session expired',
        code: 'SESSION_EXPIRED',
      } as ApiError;
    }
  }

  return handleResponse<T>(response);
}

export function createServiceClient(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestOptions, tenantSlug?: string): Promise<T> {
      return apiRequest<T>(`${baseUrl}${path}`, { ...options, method: 'GET' }, tenantSlug);
    },

    post<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
      tenantSlug?: string
    ): Promise<T> {
      return apiRequest<T>(
        `${baseUrl}${path}`,
        { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined },
        tenantSlug
      );
    },

    put<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
      tenantSlug?: string
    ): Promise<T> {
      return apiRequest<T>(
        `${baseUrl}${path}`,
        { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined },
        tenantSlug
      );
    },

    patch<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions,
      tenantSlug?: string
    ): Promise<T> {
      return apiRequest<T>(
        `${baseUrl}${path}`,
        { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined },
        tenantSlug
      );
    },

    delete<T>(path: string, options?: RequestOptions, tenantSlug?: string): Promise<T> {
      return apiRequest<T>(`${baseUrl}${path}`, { ...options, method: 'DELETE' }, tenantSlug);
    },
  };
}

// Pre-configured service clients
export const authClient = createServiceClient(ENV.AUTH_SERVICE_URL);
export const academyClient = createServiceClient(ENV.ACADEMY_SERVICE_URL);
export const examClient = createServiceClient(ENV.EXAM_SERVICE_URL);
export const contentClient = createServiceClient(ENV.CONTENT_SERVICE_URL);
export const fileClient = createServiceClient(ENV.FILE_SERVICE_URL);
export const spreadsheetClient = createServiceClient(ENV.SPREADSHEET_SERVICE_URL);
