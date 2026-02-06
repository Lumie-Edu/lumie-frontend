'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginApi } from '../api/loginApi';
import { useSessionStore, LoginRequest } from '@/entities/session';
import { useAuthModal } from '@/src/shared/providers/AuthModalProvider';

export function useLogin() {
  const router = useRouter();
  const login = useSessionStore((state) => state.login);
  const { callbackUrl, closeModal } = useAuthModal();

  return useMutation({
    mutationFn: (request: LoginRequest) => loginApi(request),
    onSuccess: (data) => {
      // Tokens are set via HttpOnly cookies by the server
      login(data.user);
      closeModal();

      // Check for callback URL
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'STUDENT') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
      }
    },
  });
}
