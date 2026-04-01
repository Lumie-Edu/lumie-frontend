'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequest, loginRequestSchema } from '@/entities/session';
import { useLogin } from '../model/useLogin';
import { ApiError } from '@/src/shared/types/api';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthModal } from '@/src/shared/providers/AuthModalProvider';
import { storage } from '@/src/shared/lib/storage';
import { ENV } from '@/src/shared/config/env';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { openRegister } = useAuthModal();

  const handleSocialLogin = (idpHint: string) => {
    const tenantSlug = storage.getTenantSlug();
    if (!tenantSlug) return;
    window.location.href = `${ENV.AUTH_SERVICE_URL}/v1/oauth2/keycloak/authorize?tenant=${encodeURIComponent(tenantSlug)}&idp_hint=${encodeURIComponent(idpHint)}`;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      userLoginId: '',
      password: '',
    },
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  const apiError = error as ApiError | null;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello Again!</h1>
      <p className="text-sm text-gray-500 mb-8">Let&apos;s get started with your 30 days trial</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{apiError.message}</p>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Email"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all ${
              errors.userLoginId ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('userLoginId')}
          />
          {errors.userLoginId && (
            <p className="mt-1 text-sm text-red-500">{errors.userLoginId.message}</p>
          )}
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all pr-12 ${
              errors.password ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
          {/* Apple */}
          <button
            type="button"
            className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </button>
          {/* Kakao */}
          <button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-[#FEE500]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222v2.218a.472.472 0 0 0 .944 0v-1.58l.787-.76 1.52 2.446a.472.472 0 0 0 .804-.499l-1.997-3.826zm-3.26.051a.472.472 0 0 0 .472-.472V9.282a.472.472 0 0 0-.944 0v4.997a.472.472 0 0 0 .472.472zm-1.367 0a.472.472 0 0 0 .472-.472V9.282a.472.472 0 0 0-.944 0v4.997a.472.472 0 0 0 .472.472z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={openRegister}
            className="text-gray-900 font-medium hover:underline"
          >
            회원가입
          </button>
        </p>
      </form>
    </div>
  );
}
