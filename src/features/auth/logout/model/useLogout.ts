'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/src/shared/api/base';
import { useSessionStore } from '@/entities/session';

async function logoutApi(): Promise<void> {
  // Tenant slug will be retrieved from session storage automatically
  return authClient.post<void>('/v1/auth/logout', undefined, undefined);
}

export function useLogout() {
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);

  return useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      // Always clear local state even if API call fails
      logout();
      router.push('/login');
    },
  });
}
