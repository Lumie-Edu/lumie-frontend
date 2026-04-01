'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/src/entities/session/model/store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useSessionStore((state) => state.login);

  useEffect(() => {
    const userParam = searchParams.get('user');
    if (!userParam) {
      router.replace('/?auth=login');
      return;
    }

    try {
      const decoded = atob(userParam.replace(/-/g, '+').replace(/_/g, '/'));
      const user = JSON.parse(decoded);
      login(user);

      const redirectPath = user.role === 'STUDENT' ? '/dashboard' : '/admin';
      router.replace(redirectPath);
    } catch {
      router.replace('/?auth=login');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Signing in...</p>
    </div>
  );
}
