'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OwnerRegisterRequest, ownerRegisterRequestSchema } from '@/entities/session';
import { useRegisterOwner } from '../model/useRegisterOwner';
import { ApiError } from '@/src/shared/types/api';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthModal } from '@/src/shared/providers/AuthModalProvider';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { openLogin } = useAuthModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OwnerRegisterRequest>({
    resolver: zodResolver(ownerRegisterRequestSchema),
    defaultValues: {
      userLoginId: '',
      password: '',
      name: '',
      phone: '',
      instituteName: '',
      businessRegistrationNumber: '',
    },
  });

  const { mutate: registerOwner, isPending, error } = useRegisterOwner();

  const onSubmit = (data: OwnerRegisterRequest) => {
    registerOwner(data);
  };

  const apiError = error as ApiError | null;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
      <p className="text-sm text-gray-500 mb-8">Create your academy account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{apiError.message}</p>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Institute Name"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all ${
              errors.instituteName ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('instituteName')}
          />
          {errors.instituteName && (
            <p className="mt-1 text-sm text-red-500">{errors.instituteName.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Business Registration Number"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all ${
              errors.businessRegistrationNumber ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('businessRegistrationNumber')}
          />
          {errors.businessRegistrationNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.businessRegistrationNumber.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Representative Name"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all ${
              errors.name ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            placeholder="01012345678"
            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all ${
              errors.phone ? 'ring-2 ring-red-500' : ''
            }`}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Login ID"
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
          {isPending ? 'Creating...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={openLogin}
            className="text-gray-900 font-medium hover:underline"
          >
            로그인
          </button>
        </p>
      </form>
    </div>
  );
}
