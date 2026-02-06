// Token storage utilities

const ACCESS_TOKEN_KEY = 'lumie_access_token';
const REFRESH_TOKEN_KEY = 'lumie_refresh_token';
const SESSION_KEY = 'lumie-session';

export const storage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  getTenantSlug(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      return parsed?.state?.user?.tenantSlug ?? null;
    } catch {
      return null;
    }
  },

  getUserId(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      return parsed?.state?.user?.id ?? null;
    } catch {
      return null;
    }
  },

  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      return parsed?.state?.user?.name ?? null;
    } catch {
      return null;
    }
  },
};
