// Session storage utilities (cookie-based auth - no token management needed)

const SESSION_KEY = 'lumie-session';

export const storage = {
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

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  },
};
