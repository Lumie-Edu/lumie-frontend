'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateStaff, CreateStaffInput, createStaffSchema } from '@/entities/staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/src/shared/types/api';

interface CreateStaffFormProps {
  onSuccess?: () => void;
}

export function CreateStaffForm({ onSuccess }: CreateStaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      userLoginId: '',
      name: '',
      phone: '',
      adminPosition: '',
    },
  });

  const { mutate: createStaff, isPending, error } = useCreateStaff();

  const onSubmit = (data: CreateStaffInput) => {
    createStaff(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  const apiError = error as ApiError | null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          placeholder="홍길동"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminPosition">직책</Label>
        <Input
          id="adminPosition"
          placeholder="예: 강사, 매니저"
          {...register('adminPosition')}
        />
        {errors.adminPosition && (
          <p className="text-sm text-red-500">{errors.adminPosition.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">전화번호</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="01012345678"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userLoginId">아이디 *</Label>
        <Input
          id="userLoginId"
          placeholder="영문, 숫자, 밑줄만 사용 가능"
          {...register('userLoginId')}
        />
        {errors.userLoginId && (
          <p className="text-sm text-red-500">{errors.userLoginId.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '생성 중...' : '직원 추가'}
      </Button>
    </form>
  );
}
