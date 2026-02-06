'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CreateAcademyInput, createAcademySchema, useCreateAcademy } from '@/entities/academy';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { ApiError } from '@/src/shared/types/api';

export function CreateAcademyForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAcademyInput>({
    resolver: zodResolver(createAcademySchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      description: '',
    },
  });

  const { mutate: createAcademy, isPending, error } = useCreateAcademy();

  const onSubmit = (data: CreateAcademyInput) => {
    createAcademy(data, {
      onSuccess: () => {
        router.push('/admin/academies');
      },
    });
  };

  const apiError = error as ApiError | null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <Input
        label="학원명 *"
        type="text"
        placeholder="학원명을 입력하세요"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="주소"
        type="text"
        placeholder="주소를 입력하세요"
        error={errors.address?.message}
        {...register('address')}
      />

      <Input
        label="연락처"
        type="tel"
        placeholder="01012345678"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="학원에 대한 설명을 입력하세요"
          {...register('description')}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>
          학원 생성
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/academies')}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
